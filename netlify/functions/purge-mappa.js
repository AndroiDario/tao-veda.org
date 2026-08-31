'use strict';

var DELETE_BATCH_SIZE = 10;

exports.handler = async function handler() {
  try {
    var config = getConfig();
    var expiredIds = await listExpiredRecordIds(config);
    var deleted = await deleteRecords(config, expiredIds);

    console.info('purge-mappa completed:', JSON.stringify({
      found: expiredIds.length,
      deleted: deleted
    }));

    return jsonResponse(200, {
      ok: true,
      found: expiredIds.length,
      deleted: deleted
    });
  } catch (error) {
    console.error('purge-mappa failed:', error && error.code ? error.code : 'unknown');

    return jsonResponse(error && error.statusCode ? error.statusCode : 500, {
      ok: false,
      error: 'Cancellazione programmata non completata.'
    });
  }
};

function getConfig() {
  var config = {
    apiKey: process.env.AIRTABLE_API_KEY,
    baseId: process.env.AIRTABLE_BASE_ID,
    tableName: process.env.AIRTABLE_TABLE_NAME
  };

  if (!config.apiKey || !config.baseId || !config.tableName) {
    throw serviceError('airtable_not_configured', 503);
  }

  return config;
}

async function listExpiredRecordIds(config) {
  var ids = [];
  var offset = '';

  do {
    var query = new URLSearchParams({
      filterByFormula: 'IS_BEFORE({Delete After}, NOW())',
      pageSize: '100'
    });

    if (offset) {
      query.set('offset', offset);
    }

    var body = await airtableRequest(config, '?' + query.toString(), { method: 'GET' });

    (body.records || []).forEach(function (record) {
      if (record && record.id) {
        ids.push(record.id);
      }
    });

    offset = body.offset || '';
  } while (offset);

  return ids;
}

async function deleteRecords(config, ids) {
  var deleted = 0;

  for (var index = 0; index < ids.length; index += DELETE_BATCH_SIZE) {
    var batch = ids.slice(index, index + DELETE_BATCH_SIZE);
    var query = new URLSearchParams();

    batch.forEach(function (id) {
      query.append('records[]', id);
    });

    var body = await airtableRequest(config, '?' + query.toString(), { method: 'DELETE' });
    deleted += (body.records || []).filter(function (record) { return record.deleted; }).length;
  }

  return deleted;
}

async function airtableRequest(config, suffix, options) {
  var url = 'https://api.airtable.com/v0/' + encodeURIComponent(config.baseId) + '/' + encodeURIComponent(config.tableName) + suffix;
  var response;

  try {
    response = await fetch(url, {
      method: options.method,
      headers: {
        Authorization: 'Bearer ' + config.apiKey,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    throw serviceError('airtable_network_error', 502);
  }

  if (!response.ok) {
    throw serviceError('airtable_http_' + response.status, 502);
  }

  return response.json().catch(function () { return {}; });
}

function serviceError(code, statusCode) {
  var error = new Error(code);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

function jsonResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

exports._test = {
  listExpiredRecordIds: listExpiredRecordIds,
  deleteRecords: deleteRecords
};
