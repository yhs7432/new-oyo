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
var TOKEN = 'oyogolf-sheet-2026';

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
    else if (action === 'log') result = writeLog_(body.entry || {});
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
`;

export const APPS_SCRIPT_STEPS = [
  '아래 코드를 복사해 주세요.',
  '구글시트에서 확장 프로그램 → Apps Script 를 엽니다.',
  '기존 내용을 모두 지우고 복사한 코드를 붙여 넣은 뒤 저장합니다.',
  '배포 → 새 배포 → 유형 “웹 앱”, 실행 계정 “나”, 액세스 “모든 사용자”로 배포합니다.',
  '나오는 웹 앱 주소(.../exec)를 아래 칸에 붙여 넣고 저장하세요.',
  '바로 아래 “연결 확인”을 눌러 시트 이름과 상품 수가 나오면 정상입니다.',
];