/**
 * The exact Apps Script source the shop owner pastes into the spreadsheet.
 * Kept as a plain string so the admin console can show it with a copy button.
 *
 * NOTE: written with plain quotes only (no template literals) so it can live
 * inside this template string safely.
 */
export const APPS_SCRIPT_CODE = `/**
 * OYO GOLF 관리자 → 구글시트 쓰기 스크립트
 * 시트에서 [확장 프로그램] → [Apps Script] 에 붙여 넣고 웹 앱으로 배포하세요.
 */
var SHEET_ID = '1iIvop4UcnSs7U_WJjvb2qLKeRWH9BbA9fb0FebsVgdw';
var SHEET_NAME = '';            // 비워 두면 첫 번째 시트를 사용합니다.
var LOG_NAME = '관리 로그';      // 처리 이력이 쌓이는 시트 이름
var ARCHIVE_NAME = '판매 완료';  // 판매 완료 상품이 한 줄씩 기록되는 시트 이름
var TOKEN = 'oyogolf-sheet-2026';

var ARCHIVE_HEADERS = [
  '판매일', '기록시각', '재고번호', '상품명', '브랜드', '카테고리', '중고등급', '상태(%)',
  '판매가(THB)', '원가(KRW)', 'VAT(THB)', '웹수수료(THB)', '순수익(THB)',
  '한국판매가(KRW)', '한국순수익(KRW)', '판매채널', '담당자', '메모',
  '환율'
];

function mainSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  if (SHEET_NAME) {
    var named = ss.getSheetByName(SHEET_NAME);
    if (named) return named;
  }
  return ss.getSheets()[0];
}

function headerMap_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var head = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  for (var i = 0; i < head.length; i += 1) {
    var name = String(head[i]).trim();
    if (name) map[name] = i;
  }
  return map;
}

function indexById_(sheet, idCol) {
  var out = {};
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return out;
  var ids = sheet.getRange(2, idCol + 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i += 1) {
    var key = String(ids[i][0]).trim();
    if (key && out[key] === undefined) out[key] = i + 2;
  }
  return out;
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = mainSheet_();
  var payload = {
    ok: true,
    sheet: sheet.getName(),
    rows: Math.max(sheet.getLastRow() - 1, 0)
  };

  // 관리자 화면의 “연결 확인”은 브라우저 보안 제약 때문에 JSONP 방식으로 응답을 확인합니다.
  var callback = (e && e.parameter) ? String(e.parameter.callback || '') : '';
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + JSON.stringify(payload) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(payload);
}

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    if (String(body.token) !== TOKEN) {
      throw new Error('연결 토큰이 올바르지 않습니다.');
    }

    // 같은 요청이 두 번 도착해도 한 번만 처리합니다.
    var requestId = String(body.requestId || '');
    var cache = CacheService.getScriptCache();
    if (requestId && cache.get(requestId)) {
      return json_({ ok: true, message: '이미 처리된 요청입니다.' });
    }

    var action = body.action || 'update';
    var result;
    if (action === 'update') result = updateRows_(body.rows || []);
    else if (action === 'create') result = createRow_(body.values || {});
    else if (action === 'delete') result = deleteRows_(body.rows || []);
    else if (action === 'log') result = writeLog_(body.entry || {});
    else if (action === 'archive') result = archiveSale_(body.entry || {});
    else if (action === 'unarchive') result = unarchiveSale_(body.rows || []);
    else throw new Error('지원하지 않는 요청입니다.');

    if (requestId && result.ok) cache.put(requestId, '1', 600);
    return json_(result);
  } catch (err) {
    var msg = (err && err.message) ? err.message : String(err);
    return json_({ ok: false, message: msg });
  }
}

function updateRows_(rows) {
  var sheet = mainSheet_();
  var map = headerMap_(sheet);
  var idCol = map['재고번호'];
  if (idCol === undefined) throw new Error('시트에 재고번호 열이 없습니다.');

  var index = indexById_(sheet, idCol);
  var updated = 0;
  var missing = [];

  for (var r = 0; r < rows.length; r += 1) {
    var row = rows[r] || {};
    var target = index[String(row.id || '').trim()];
    if (!target) {
      missing.push(row.id);
      continue;
    }
    var fields = row.fields || {};
    for (var key in fields) {
      if (!Object.prototype.hasOwnProperty.call(fields, key)) continue;
      var col = map[key];
      if (col === undefined) continue;
      sheet.getRange(target, col + 1).setValue(fields[key]);
    }
    updated += 1;
  }

  SpreadsheetApp.flush();
  return {
    ok: true,
    updated: updated,
    missing: missing,
    message: '시트에 저장했습니다. ' + updated + '건 반영'
  };
}

function createRow_(values) {
  var sheet = mainSheet_();
  var map = headerMap_(sheet);
  var idCol = map['재고번호'];
  if (idCol === undefined) throw new Error('시트에 재고번호 열이 없습니다.');

  var id = String(values['재고번호'] || '').trim();
  if (!id) throw new Error('재고번호를 입력해 주세요.');

  var index = indexById_(sheet, idCol);
  if (index[id]) throw new Error('이미 사용 중인 재고번호입니다: ' + id);

  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var head = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var row = [];
  for (var i = 0; i < head.length; i += 1) {
    var name = String(head[i]).trim();
    row.push(values[name] !== undefined ? values[name] : '');
  }

  sheet.appendRow(row);
  SpreadsheetApp.flush();
  return { ok: true, message: id + ' 상품을 등록했습니다.' };
}

function deleteRows_(rows) {
  var sheet = mainSheet_();
  var map = headerMap_(sheet);
  var idCol = map['재고번호'];
  if (idCol === undefined) throw new Error('시트에 재고번호 열이 없습니다.');

  var index = indexById_(sheet, idCol);
  var targets = [];
  var removed = [];
  var missing = [];

  for (var r = 0; r < rows.length; r += 1) {
    var row = rows[r] || {};
    var key = String(row.id || '').trim();
    var target = index[key];
    if (!target) {
      missing.push(key);
      continue;
    }
    targets.push({ row: target, id: key, name: String(row.name || '') });
  }

  // 아래쪽 행부터 지워야 위쪽 행 번호가 밀리지 않습니다.
  targets.sort(function (a, b) { return b.row - a.row; });
  for (var t = 0; t < targets.length; t += 1) {
    sheet.deleteRow(targets[t].row);
    removed.push(targets[t]);
  }

  SpreadsheetApp.flush();

  for (var l = 0; l < removed.length; l += 1) {
    writeLog_({
      '구분': '삭제',
      '재고번호': removed[l].id,
      '상품명': removed[l].name,
      '이전값': '시트 행 삭제',
      '새값': '',
      '메모': '관리자 화면에서 삭제'
    });
  }

  return {
    ok: true,
    deleted: removed.length,
    missing: missing,
    message: removed.length + '건을 시트에서 삭제했습니다.'
  };
}

function writeLog_(entry) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var log = ss.getSheetByName(LOG_NAME);
  if (!log) {
    log = ss.insertSheet(LOG_NAME);
    log.appendRow(['기록시각', '구분', '재고번호', '상품명', '이전값', '새값', '메모', '담당자']);
    log.setFrozenRows(1);
  }
  log.appendRow([
    new Date(),
    entry['구분'] || '',
    entry['재고번호'] || '',
    entry['상품명'] || '',
    entry['이전값'] || '',
    entry['새값'] || '',
    entry['메모'] || '',
    entry['담당자'] || ''
  ]);
  SpreadsheetApp.flush();
  return { ok: true, message: '이력을 기록했습니다.' };
}

/** 판매 완료 시트를 찾고, 없으면 머리글까지 만들어 둡니다. */
function archiveSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(ARCHIVE_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(ARCHIVE_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(ARCHIVE_HEADERS);
    sheet.setFrozenRows(1);
  } else {
    // 나중에 추가된 열(환율 등)이 없으면 머리글 오른쪽 끝에 이어 붙입니다.
    var lastCol = Math.max(sheet.getLastColumn(), 1);
    var head = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var existing = {};
    for (var i = 0; i < head.length; i += 1) {
      var name = String(head[i]).trim();
      if (name) existing[name] = true;
    }
    var missing = [];
    for (var h = 0; h < ARCHIVE_HEADERS.length; h += 1) {
      if (!existing[ARCHIVE_HEADERS[h]]) missing.push(ARCHIVE_HEADERS[h]);
    }
    if (missing.length > 0) {
      sheet.getRange(1, lastCol + 1, 1, missing.length).setValues([missing]);
    }
  }
  return sheet;
}

/**
 * 판매 완료 상품을 '판매 완료' 시트에 한 줄로 기록합니다.
 * 같은 재고번호가 이미 있으면 새 줄을 만들지 않고 그 줄을 갱신합니다.
 */
function archiveSale_(entry) {
  var sheet = archiveSheet_();
  var lastCol = Math.max(sheet.getLastColumn(), ARCHIVE_HEADERS.length);
  var head = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  for (var i = 0; i < head.length; i += 1) {
    var name = String(head[i]).trim();
    if (name) map[name] = i;
  }

  var idCol = map['재고번호'];
  var target = 0;
  if (idCol !== undefined) {
    var index = indexById_(sheet, idCol);
    target = index[String(entry['재고번호'] || '').trim()] || 0;
  }

  var row = [];
  for (var c = 0; c < head.length; c += 1) row.push('');

  // 이미 기록된 줄을 갱신할 때는 기존 값을 그대로 두고 넘어온 칸만 고칩니다.
  if (target) {
    var previousRow = sheet.getRange(target, 1, 1, head.length).getValues()[0];
    for (var p = 0; p < head.length; p += 1) row[p] = previousRow[p];
  }

  for (var key in entry) {
    if (!Object.prototype.hasOwnProperty.call(entry, key)) continue;
    if (map[key] === undefined) continue;
    row[map[key]] = entry[key];
  }
  if (map['기록시각'] !== undefined) row[map['기록시각']] = new Date();

  if (target) {
    sheet.getRange(target, 1, 1, head.length).setValues([row]);
    SpreadsheetApp.flush();
    return { ok: true, updated: 1, message: '판매 완료 시트의 기존 기록을 갱신했습니다.' };
  }

  sheet.appendRow(row);
  SpreadsheetApp.flush();
  return { ok: true, created: 1, message: '판매 완료 시트에 기록했습니다.' };
}

/**
 * 판매 완료를 되돌린 상품의 기록을 '판매 완료' 시트에서 지웁니다.
 * 재고번호가 같은 줄을 모두 찾아 아래쪽부터 삭제합니다.
 */
function unarchiveSale_(rows) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(ARCHIVE_NAME);
  if (!sheet || sheet.getLastRow() < 2) {
    return { ok: true, removed: 0, message: '판매 완료 시트에 지울 기록이 없습니다.' };
  }

  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var head = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var idCol = -1;
  for (var i = 0; i < head.length; i += 1) {
    if (String(head[i]).trim() === '재고번호') { idCol = i; break; }
  }
  if (idCol === -1) throw new Error('판매 완료 시트에 재고번호 열이 없습니다.');

  var wanted = {};
  for (var r = 0; r < rows.length; r += 1) {
    var row = rows[r] || {};
    var key = String(row.id || '').trim();
    if (!key) continue;
    wanted[key] = String(row.name || '');
  }

  var lastRow = sheet.getLastRow();
  var ids = sheet.getRange(2, idCol + 1, lastRow - 1, 1).getValues();
  var targets = [];
  for (var s = 0; s < ids.length; s += 1) {
    var found = String(ids[s][0]).trim();
    if (wanted[found] === undefined) continue;
    targets.push({ row: s + 2, id: found, name: wanted[found] });
  }

  // 아래쪽 행부터 지워야 위쪽 행 번호가 밀리지 않습니다.
  targets.sort(function (a, b) { return b.row - a.row; });
  var removed = [];
  for (var t = 0; t < targets.length; t += 1) {
    sheet.deleteRow(targets[t].row);
    removed.push(targets[t]);
  }
  SpreadsheetApp.flush();

  for (var l = 0; l < removed.length; l += 1) {
    writeLog_({
      '구분': '판매 취소',
      '재고번호': removed[l].id,
      '상품명': removed[l].name,
      '이전값': '판매 완료 시트 기록',
      '새값': '판매 완료 → 판매 가능으로 되돌림',
      '메모': '판매 완료 기록 삭제'
    });
  }

  if (removed.length === 0) {
    return { ok: true, removed: 0, message: '판매 완료 시트에 해당 기록이 없어 그대로 두었습니다.' };
  }
  return {
    ok: true,
    removed: removed.length,
    message: '판매 완료 시트 기록 ' + removed.length + '건을 지웠습니다.'
  };
}
`;

export const APPS_SCRIPT_STEPS = [
  '아래 코드를 복사해 주세요.',
  '구글시트에서 확장 프로그램 → Apps Script 를 엽니다.',
  '기존 내용을 모두 지우고 복사한 코드를 붙여 넣은 뒤 저장합니다.',
  '배포 → 새 배포 → 유형 “웹 앱”, 실행 계정 “나”, 액세스 “모든 사용자”로 배포합니다.',
  '나오는 웹 앱 주소(.../exec)를 아래 칸에 붙여 넣고 저장하세요.',
  '바로 아래 “연결 확인”을 눌러 시트 이름과 상품 수가 나오면 정상입니다.',
];