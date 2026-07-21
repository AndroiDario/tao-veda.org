import { access, chmod, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, '..');
const supabaseExecutable = join(repositoryRoot, 'node_modules', '.bin', 'supabase');

function usage() {
  return [
    'Uso:',
    '  SUPABASE_DB_URL=postgresql://... \\',
    '  TAO_VEDA_BACKUP_PASSPHRASE=... \\',
    '  npm run supabase:backup -- /percorso/assoluto/fuori-dal-repository',
    '',
    'Il comando crea un archivio .tar.gz.enc con permessi 0600.',
    'La password e la passphrase restano nelle variabili d’ambiente.',
  ].join('\n');
}

function requiredEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Variabile ${name} assente.`);
  return value;
}

function run(command, args, options = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.once('error', rejectPromise);
    child.once('exit', (code, signal) => {
      if (code === 0) return resolvePromise();
      rejectPromise(new Error(`${command} non riuscito (${signal ? `segnale ${signal}` : `codice ${code}`}).`));
    });
  });
}

async function assertNonEmpty(path) {
  const fileStat = await stat(path);
  if (!fileStat.isFile() || fileStat.size === 0) {
    throw new Error(`Backup incompleto: ${path} è vuoto.`);
  }
}

async function assertMissing(path) {
  try {
    await access(path, constants.F_OK);
  } catch {
    return;
  }
  throw new Error(`Il file di destinazione esiste già: ${path}`);
}

async function main() {
  process.umask(0o077);

  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(usage());
    return;
  }

  const destinationArgument = process.argv[2];
  if (!destinationArgument || !isAbsolute(destinationArgument)) {
    throw new Error(`Serve una cartella di destinazione assoluta.\n\n${usage()}`);
  }

  const destination = resolve(destinationArgument);
  const destinationRelativeToRepo = relative(repositoryRoot, destination);
  if (destinationRelativeToRepo === '' || (!destinationRelativeToRepo.startsWith('..') && !isAbsolute(destinationRelativeToRepo))) {
    throw new Error('Il backup contiene dati personali e deve restare fuori dal repository.');
  }

  const databaseUrl = requiredEnvironment('SUPABASE_DB_URL');
  const passphrase = requiredEnvironment('TAO_VEDA_BACKUP_PASSPHRASE');
  if (!/^postgres(?:ql)?:\/\//.test(databaseUrl)) {
    throw new Error('SUPABASE_DB_URL deve essere una connection string PostgreSQL completa.');
  }
  if (passphrase.length < 16) {
    throw new Error('TAO_VEDA_BACKUP_PASSPHRASE deve contenere almeno 16 caratteri.');
  }

  await access(supabaseExecutable, constants.X_OK);
  await mkdir(destination, { recursive: true, mode: 0o700 });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = join(destination, `tao-veda-supabase-${timestamp}.tar.gz.enc`);
  await assertMissing(outputPath);

  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'tao-veda-supabase-backup-'));
  const rolesPath = join(temporaryDirectory, 'roles.sql');
  const schemaPath = join(temporaryDirectory, 'schema.sql');
  const dataPath = join(temporaryDirectory, 'data.sql');
  const manifestPath = join(temporaryDirectory, 'manifest.json');
  const archivePath = join(temporaryDirectory, 'backup.tar.gz');
  let backupCompleted = false;

  try {
    const dumpBase = ['db', 'dump', '--db-url', databaseUrl];
    await run(supabaseExecutable, [...dumpBase, '-f', rolesPath, '--role-only']);
    await run(supabaseExecutable, [...dumpBase, '-f', schemaPath]);
    await run(supabaseExecutable, [
      ...dumpBase,
      '-f', dataPath,
      '--use-copy',
      '--data-only',
      '-x', 'storage.buckets_vectors',
      '-x', 'storage.vector_indexes',
    ]);

    await Promise.all([assertNonEmpty(rolesPath), assertNonEmpty(schemaPath), assertNonEmpty(dataPath)]);
    await writeFile(manifestPath, `${JSON.stringify({
      projectRef: 'byyanpcxwwjshdivvhpc',
      createdAt: new Date().toISOString(),
      files: ['roles.sql', 'schema.sql', 'data.sql'],
      encrypted: true,
    }, null, 2)}\n`, { mode: 0o600 });

    await run('tar', [
      '-czf', archivePath,
      '-C', temporaryDirectory,
      'roles.sql', 'schema.sql', 'data.sql', 'manifest.json',
    ]);
    await run('openssl', [
      'enc', '-aes-256-cbc', '-salt', '-pbkdf2',
      '-in', archivePath,
      '-out', outputPath,
      '-pass', 'env:TAO_VEDA_BACKUP_PASSPHRASE',
    ], { env: process.env });

    await assertNonEmpty(outputPath);
    await chmod(outputPath, 0o600);
    backupCompleted = true;

    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    console.log(`Backup cifrato creato: ${outputPath}`);
    console.log(`Progetto: ${manifest.projectRef}; creato: ${manifest.createdAt}`);
  } finally {
    if (!backupCompleted) await rm(outputPath, { force: true });
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(`Backup Supabase non riuscito: ${error.message}`);
  process.exitCode = 1;
});
