(function() {
    // ----------------------------------------------------------------
    // Helper functions (inlined from script-utils for closure scope)
    // ----------------------------------------------------------------
    function normalizeToFriday(dateStr) {
        if (!dateStr) return null;
        var m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
        var d = m ? new Date(+m[1], +m[2]-1, +m[3]) : new Date(dateStr);
        d.setHours(0,0,0,0,0);
        if (isNaN(d.getTime())) return null;
        var day = d.getDay();
        var diff = (day >= 5) ? (day - 5) : (day + 2);
        var friday = new Date(d); friday.setDate(d.getDate() - diff);
        friday.setHours(0,0,0,0,0);
        return formatLocalDate(friday);
    }
    function normalizeToWeekStart(dateStr) {
        if (!dateStr) return null;
        var m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
        var d = m ? new Date(+m[1], +m[2]-1, +m[3]) : new Date(dateStr);
        d.setHours(0,0,0,0,0);
        if (isNaN(d.getTime())) return null;
        var day = d.getDay();
        var diff = (day >= 5) ? (day - 5) : (day + 2);
        var friday = new Date(d); friday.setDate(d.getDate() - diff);
        friday.setHours(0,0,0,0,0);
        return formatLocalDate(friday);
    }
    function formatDateDDMMMYYYY(dateVal) {
        var d = new Date(dateVal);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    }
    function formatDateDDMMM(dateVal) {
        var d = new Date(dateVal);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return ('0'+d.getDate()).slice(-2) + ' ' + months[d.getMonth()];
    }
    function formatCurrentTimestamp() {
        var d = new Date();
        var p = function(n){return String(n).padStart(2,'0');};
        return d.getFullYear() + '-' + p(d.getMonth()+1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
    }
    function formatLocalDate(d) {
        var y = d.getFullYear();
        var m = String(d.getMonth() + 1).padStart(2, '0');
        var day = String(d.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + day;
    }
    function dateFromDateLocal(val) {
        if (!val) return '';
        var m = String(val).match(/^(\d{4}-\d{2}-\d{2})/);
        return m ? m[1] : val;
    }
    function filterActiveMembers(members, selectedDate) {
        if (!members || !members.length) return [];
        var selStr = (selectedDate || '').slice(0,10);
        var seqMap = {};
        members.forEach(function(m) {
            var seq = m.custom_id || 0;
            if (!seqMap[seq]) seqMap[seq] = [];
            seqMap[seq].push(m);
        });
        var result = [];
        Object.keys(seqMap).forEach(function(seq) {
            var group = seqMap[seq];
            var best = null;
            group.forEach(function(m) {
                var eff = m.effective_date;
                if (!eff) {
                    if (!best || best.effective_date) best = m;
                } else {
                    var effStr = eff.slice(0,10);
                    if (effStr <= selStr && (!best || !best.effective_date || best.effective_date.slice(0,10) < effStr)) {
                        best = m;
                    }
                }
            });
            if (best) result.push(best);
        });
        return result;
    }
    function formatDisplayDate(dateStr) {
        if (!dateStr) return '';
        var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        var m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
        if (m) {
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var h = +m[4], min = +m[5];
            var dt = new Date(+m[1], +m[2]-1, +m[3]);
            var dayName = days[dt.getDay()];
            return dayName + ', ' + (+m[3]) + ' ' + months[+m[2]-1] + ' ' + m[1] + ', ' + (h % 12 || 12) + ':' + String(min).padStart(2,'0') + ' ' + (h >= 12 ? 'PM' : 'AM');
        }
        var d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var h = d.getHours(), min = d.getMinutes();
            return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear() + ', ' + (h % 12 || 12) + ':' + String(min).padStart(2,'0') + ' ' + (h >= 12 ? 'PM' : 'AM');
        }
        return dateStr;
    }

    function resolveMemberCustomId(userId) {
        if (!userId) return Promise.resolve(null);
        return _supabase.from('members').select('id,custom_id').eq('id', userId).maybeSingle().then(function(r) {
            if (r.data) return r.data.custom_id;
            return _supabase.from('members').select('id,custom_id').eq('custom_id', String(userId)).maybeSingle().then(function(r2) {
                return r2.data ? r2.data.custom_id : null;
            });
        });
    }

    var _ok = null, _err = null;
    var api = {
        withSuccessHandler: function(fn) { _ok = fn; return this; },
        withFailureHandler: function(fn) { _err = fn; return this; },
        // ----------------------------------------------------------------
        // getUserList
        // ----------------------------------------------------------------
        getUserList: function(selectedDate) {
            var self = this;
            var ok = _ok, err = _err;
            _supabase.from('members').select('id,custom_id,name_en,name_ta,effective_date').order('custom_id', { ascending: true }).then(function(r) {
                if (r.error) { if (err) err(r.error); else console.error(r.error); return; }
                var active = selectedDate ? filterActiveMembers(r.data, selectedDate) : r.data;
                var out = active.map(function(u) { return { id: u.id, custom_id: u.custom_id, english: u.name_en||'', tamil: u.name_ta||'', effective_date: u.effective_date||null }; });
                if (ok) ok(out);
            });
            return this;
        },
        // ----------------------------------------------------------------
        // lookupTamilName
        // ----------------------------------------------------------------
        lookupTamilName: function(userId) {
            var self = this;
            var ok = _ok;
            _supabase.from('members').select('name_ta').eq('id', userId).single().then(function(r) {
                if (ok) ok((r.data && r.data.name_ta) || '');
            });
            return this;
        },
        // ----------------------------------------------------------------
        // getAvailableSupportUsers
        // ----------------------------------------------------------------
        getAvailableSupportUsers: function(selectedDate, excludeCustomId) {
            var self = this;
            var ok = _ok;
            var norm = normalizeToWeekStart(selectedDate);
            _supabase.from('weekly_status').select('member_id').eq('week_start', norm).eq('status', 'Exception Raised').then(function(rExc) {
                var excIds = {};
                if (rExc.data) rExc.data.forEach(function(x) { excIds[x.member_id] = true; });
                _supabase.from('members').select('id,custom_id,name_en,name_ta,effective_date').order('custom_id', { ascending: true }).then(function(rCfg) {
                    if (!rCfg.data) { if (ok) ok([]); return; }
                    var active = filterActiveMembers(rCfg.data, selectedDate);
                    var out = [];
                    active.forEach(function(u) {
                        if (u.custom_id !== excludeCustomId && !excIds[u.custom_id]) out.push({ id: u.id, custom_id: u.custom_id, english: u.name_en||'', tamil: u.name_ta||'' });
                    });
                    if (ok) ok(out);
                });
            });
            return this;
        },
        // ----------------------------------------------------------------
        // findStatusAssignment
        // ----------------------------------------------------------------
        findStatusAssignment: function(userId, customId, selectedDate) {
            var self = this;
            var ok = _ok;
            function run(cid) {
                var dateOnly = dateFromDateLocal(selectedDate);
                var inputDate = new Date(dateOnly); inputDate.setHours(0,0,0,0,0);

                var selParts = selectedDate.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/);
                var selectedDT = selParts ? new Date(+selParts[1], +selParts[2]-1, +selParts[3], +selParts[4], +selParts[5]) : null;

                function fridayOf(dateStr) {
                    var m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
                    var d = m ? new Date(+m[1], +m[2]-1, +m[3]) : new Date(dateStr);
                    d.setHours(0,0,0,0,0);
                    if (isNaN(d.getTime())) return null;
                    var day = d.getDay();
                    var diff = (day >= 5) ? (day - 5) : (day + 2);
                    var f = new Date(d); f.setDate(d.getDate() - diff);
                    return formatLocalDate(f);
                }

                var selectedFriday = fridayOf(dateOnly);
                var prevFridayDate = new Date(selectedFriday + 'T00:00:00');
                prevFridayDate.setDate(prevFridayDate.getDate() - 7);
                var prevFriday = formatLocalDate(prevFridayDate);

                _supabase.from('hadiya_details').select('next_hadiya_start_moment').eq('start_date', prevFriday).limit(1).then(function(rH) {
                    var cutoffTime = null;
                    if (rH.data && rH.data.length > 0 && rH.data[0].next_hadiya_start_moment) {
                        var raw = rH.data[0].next_hadiya_start_moment;
                        var s = String(raw).trim().replace(' ', 'T');
                        var hasTimezone = s.endsWith('Z') || /[\+\-]\d{2}:\d{2}$/.test(s) || /[\+\-]\d{4}$/.test(s);
                        var d;
                        if (hasTimezone) {
                            d = new Date(s);
                        } else {
                            var p = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
                            if (p) {
                                d = new Date(+p[1], +p[2]-1, +p[3], +p[4], +p[5], +(p[6]||0));
                            } else {
                                d = new Date(s);
                            }
                        }
                        if (!isNaN(d.getTime())) cutoffTime = d;
                    }

                    var isBeforeNextStart = cutoffTime && selectedDT && selectedDT.getTime() < cutoffTime.getTime();

                    var adjustedInputDate = inputDate;
                    if (isBeforeNextStart && selectedFriday) {
                        adjustedInputDate = new Date(inputDate);
                        adjustedInputDate.setDate(adjustedInputDate.getDate() - 7);
                    }

                    _supabase.from('weekly_status').select('week_start,member_name,status,completed_date_time,exception_raised_time,supported_by_name,supported_by_id,support_status').eq('member_id', cid).lte('week_start', formatLocalDate(adjustedInputDate)).order('week_start', { ascending: false }).limit(1).then(function(rStat) {
                        if (!rStat.data || rStat.data.length === 0) {
                            var monday = normalizeToWeekStart(formatLocalDate(inputDate));
                            var result = {
                                dateFound: formatDateDDMMMYYYY(monday),
                                rawDate: new Date(monday).toISOString(),
                                savedStatus: 'Not Started',
                                savedLastModified: '',
                                statusTimestamp: '',
                                supportedByName: '',
                                supportedById: '',
                                supportStatus: ''
                            };
                            if (ok) ok(result);
                            return;
                        }
                        var st = rStat.data[0];
                        var currentTrackerStatus = st.status || 'Reciting';
                        var statusTimestamp = '';
                        var supportedByName = st.supported_by_name || '';
                        var supportedById = st.supported_by_id || '';
                        var supportStatus = st.support_status || '';
                        var trackerLastModified = '';
                        var compTime = st.completed_date_time || '';
                        var excTime = st.exception_raised_time || '';
                        statusTimestamp = compTime || excTime || '';
                        if (currentTrackerStatus === 'Completed' && compTime) trackerLastModified = 'Completed on: ' + formatDisplayDate(compTime);
                        else if (currentTrackerStatus === 'Exception Raised' && excTime) trackerLastModified = 'Exception raised on: ' + formatDisplayDate(excTime);
                        var result = {
                            dateFound: formatDateDDMMMYYYY(st.week_start),
                            rawDate: new Date(st.week_start).toISOString(),
                            savedStatus: currentTrackerStatus,
                            savedLastModified: trackerLastModified,
                            statusTimestamp: statusTimestamp,
                            supportedByName: supportedByName,
                            supportedById: supportedById,
                            supportStatus: supportStatus,
                            supportingName: '',
                            supportingNameTa: '',
                            supportingUserId: '',
                            supportAssignmentStatus: ''
                        };
                        _supabase.from('weekly_status').select('member_id,member_name,support_status,week_start').eq('supported_by_id', userId).eq('week_start', st.week_start).limit(1).then(function(rSup) {
                            if (rSup.data && rSup.data.length > 0) {
                                var sup = rSup.data[0];
                                result.supportingName = sup.member_name || '';
                                result.supportingUserId = sup.member_id || '';
                                result.supportAssignmentStatus = sup.support_status || 'Reciting';
                                _supabase.from('members').select('name_ta').eq('custom_id', sup.member_id).limit(1).then(function(rNameTa) {
                                    result.supportingNameTa = rNameTa.data ? rNameTa.data.name_ta : '';
                                    if (ok) ok(result);
                                });
                            } else {
                                if (ok) ok(result);
                            }
                        });
                    });
                });
            }
            if (!customId) {
                _supabase.from('members').select('custom_id').eq('id', userId).single().then(function(rCid) {
                    if (!rCid.data) { if (ok) ok({ error: "Member not found." }); return; }
                    run(rCid.data.custom_id);
                });
            } else {
                run(customId);
            }
            return this;
        },
        // ----------------------------------------------------------------
        // getHadiyaDetails
        // ----------------------------------------------------------------
        getHadiyaDetails: function(selectedDate) {
            var self = this;
            var ok = _ok;
            function ld(s) {
                var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
                return m ? new Date(+m[1], +m[2]-1, +m[3]) : new Date(s);
            }
            var inputDate = ld(selectedDate); inputDate.setHours(0,0,0,0,0);
            _supabase.from('hadiya_details').select('*').order('start_date', { ascending: true }).then(function(rH) {
                if (!rH.data || rH.data.length === 0) { if (ok) ok(null); return; }
                var hadData = rH.data;
                var currentIdx = -1; var latestDate = null;
                for (var i = 0; i < hadData.length; i++) {
                    var rd = ld(hadData[i].start_date); rd.setHours(0,0,0,0,0);
                    if (rd <= inputDate && (!latestDate || rd > latestDate)) { latestDate = rd; currentIdx = i; }
                }
                if (currentIdx === -1) { if (ok) ok(null); return; }
                var now = new Date();
                var IST_MS = 5.5 * 3600000;
                var nowIST = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + IST_MS);
                var today = new Date(nowIST); today.setHours(0,0,0,0,0);
                var todayIdx = -1; var todayDate = null;
                for (var i = 0; i < hadData.length; i++) {
                    var rd = ld(hadData[i].start_date); rd.setHours(0,0,0,0,0);
                    if (rd <= today && (!todayDate || rd > todayDate)) { todayDate = rd; todayIdx = i; }
                }
                var getRowData = function(idx) {
                    if (idx < 0 || idx >= hadData.length || !hadData[idx].nominated_to) return null;
                    var row = hadData[idx];
                    var startDate = ld(row.start_date);
                    var endDate = new Date(startDate); endDate.setDate(endDate.getDate() + 6);
                    var rangeStr = formatDateDDMMM(startDate) + ' - ' + formatDateDDMMM(endDate);
                    var nominatedTo = row.nominated_to || '';
                    var nominatedToTa = row.nominated_to_ta || '';
                    var dedicatedTo = row.dedicated_to || '';
                    var dedicatedToTa = row.dedicated_to_ta || '';
                    var hadiyaStatus = row.status || 'Pending';
                    var rawDeadline = row.countdown_end_moment || '';
                    var rawNextStart = row.next_hadiya_start_moment || '';
                    var rawDedPurposeEn = row.dedicated_purpose_english || '';
                    var rawDedPurposeTa = row.dedicated_purpose_tamil || '';
                    var deadlineISO = '', deadlineDisplay = '', nextStartISO = '', nextStartDisplay = '', purposeEn = '', purposeTa = '';
                    if (rawDeadline) { var pd = parseDT(rawDeadline); if (!isNaN(pd.getTime())) { deadlineISO = pd.toISOString(); deadlineDisplay = fmtDL(pd); } }
                    if (rawNextStart) { var pn = parseDT(rawNextStart); if (!isNaN(pn.getTime())) { nextStartISO = pn.toISOString(); nextStartDisplay = fmtDL(pn); } }
                    if (rawDedPurposeEn) { purposeEn = rawDedPurposeEn; }
                    if (rawDedPurposeTa) { purposeTa = rawDedPurposeTa; }
                    return {
                        en: nominatedTo, ta: nominatedToTa, range: rangeStr,
                        dedicatedTo: dedicatedTo, dedicatedToTa: dedicatedToTa,
                        dedicatedToEn: dedicatedTo,
                        dedicatedPurposeEn: purposeEn,
                        dedicatedPurposeTa: purposeTa,
                        status: hadiyaStatus,
                        weekEndDate: endDate.toISOString(),
                        deadlineISO: deadlineISO,
                        nextStartISO: nextStartISO,
                        deadlineDisplay: deadlineDisplay,
                        nextStartDisplay: nextStartDisplay,
                        rawIdx: idx,
                        startDate: row.start_date
                    };
                };
                function parseDT(str) {
                    var s = String(str).replace(' ', 'T');
                    var hasTZ = s.endsWith('Z') || /[\+-]\d{2}:\d{2}$/.test(s) || /[\+-]\d{4}$/.test(s);
                    if (hasTZ) {
                        var d = new Date(s);
                        return isNaN(d.getTime()) ? new Date() : d;
                    }
                    var p = s.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/);
                    if (p) return new Date(+p[1],+p[2]-1,+p[3],+p[4],+p[5],+(p[6]||0));
                    var d = new Date(s);
                    return isNaN(d.getTime()) ? new Date() : d;
                }
                function fmtDL(d) {
                    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
                }
                function applyAdvanceLogic(idx, refTime) {
                    if (idx < 0) return idx;
                    if (idx > 0) {
                        var prevRowRaw = getRowData(idx - 1);
                        if (prevRowRaw && prevRowRaw.nextStartISO) {
                            var prevStartDT = parseDT(prevRowRaw.nextStartISO);
                            if (!isNaN(prevStartDT.getTime()) && refTime.getTime() < prevStartDT.getTime()) {
                                idx--;
                            }
                        }
                    }
                    var r = getRowData(idx);
                    if (r && r.nextStartISO && idx + 1 < hadData.length) {
                        var nextStartDT = parseDT(r.nextStartISO);
                        if (!isNaN(nextStartDT.getTime()) && refTime.getTime() >= nextStartDT.getTime()) {
                            idx++;
                        }
                    }
                    return idx;
                }
                var curRow = getRowData(currentIdx);
                if (!curRow) { if (ok) ok(null); return; }
                var selParts = selectedDate.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/);
                if (selParts) {
                    var selIST = new Date(+selParts[1], +selParts[2]-1, +selParts[3], +selParts[4], +selParts[5]);
                    currentIdx = applyAdvanceLogic(currentIdx, selIST);
                    curRow = getRowData(currentIdx);
                    if (!curRow) { if (ok) ok(null); return; }
                }
                todayIdx = applyAdvanceLogic(todayIdx, nowIST);
                var targetRef = ld(curRow.startDate) || new Date(0);
                targetRef.setHours(0,0,0,0,0);
                var tDay = targetRef.getDay();
                var tDiff = (tDay >= 5) ? (tDay - 5) : (tDay + 2);
                var fridayBase = new Date(targetRef); fridayBase.setDate(targetRef.getDate() - tDiff);
                var mondayStr = formatLocalDate(fridayBase);
                _supabase.from('weekly_status').select('*').eq('week_start', mondayStr).then(function(rStat) {
                    var completedList = []; var recitingList = []; var supportersList = [];
                    if (rStat.data) {
                        rStat.data.forEach(function(s) {
                            var name = s.member_name || '';
                            if (!name) return;
                            var status = s.status || 'Not Started';
                            var supportStatus = s.support_status || '';
                            var enName = name.indexOf('|') > -1 ? name.split('|')[0].trim() : name;
                            var taName = name.indexOf('|') > -1 ? name.split('|')[1].trim() : name;
                            var isDone = (status === 'Completed') || (status === 'Exception Raised' && supportStatus === 'Completed');
                            var person = { en: enName, ta: taName };
                            if (isDone) completedList.push(person);
                            else if (status === 'Reciting' || status === 'Not Started' || status === 'Exception Raised') recitingList.push(person);
                            var supporterName = s.supported_by_name || '';
                            if (supporterName) {
                                var sEn = supporterName.indexOf('|') > -1 ? supporterName.split('|')[0].trim() : supporterName;
                                var sTa = supporterName.indexOf('|') > -1 ? supporterName.split('|')[1].trim() : supporterName;
                                supportersList.push({ en: sEn, ta: sTa });
                            }
                        });
                    }
                    var result = {
                        current: getRowData(currentIdx),
                        previous: getRowData(currentIdx - 1),
                        next: getRowData(currentIdx + 1),
                        currentIndex: currentIdx,
                        todayIndex: todayIdx,
                        weekStart: mondayStr,
                        completedList: completedList,
                        recitingList: recitingList,
                        supportersList: supportersList
                    };
                    if (ok) ok(result);
                });
            });
            return this;
        },
        // ----------------------------------------------------------------
        // getWeeklyReport
        // ----------------------------------------------------------------
        getWeeklyReport: function(selectedDate) {
            var self = this;
            var ok = _ok;
            var dateOnly = dateFromDateLocal(selectedDate);
            function fridayOf(dateStr) {
                var m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
                var d = m ? new Date(+m[1], +m[2]-1, +m[3]) : new Date(dateStr);
                d.setHours(0,0,0,0,0);
                if (isNaN(d.getTime())) return null;
                var day = d.getDay();
                var diff = (day >= 5) ? (day - 5) : (day + 2);
                var f = new Date(d); f.setDate(d.getDate() - diff);
                return formatLocalDate(f);
            }
            var selParts = selectedDate.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/);
            var selectedDT = selParts ? new Date(+selParts[1], +selParts[2]-1, +selParts[3], +selParts[4], +selParts[5]) : null;

            var selectedFriday = fridayOf(dateOnly);
            var prevFridayDate = new Date(selectedFriday + 'T00:00:00');
            prevFridayDate.setDate(prevFridayDate.getDate() - 7);
            var prevFriday = formatLocalDate(prevFridayDate);
            _supabase.from('hadiya_details').select('next_hadiya_start_moment').eq('start_date', prevFriday).limit(1).then(function(rH) {
                var cutoffTime = null;
                if (rH.data && rH.data.length > 0 && rH.data[0].next_hadiya_start_moment) {
                    var raw = rH.data[0].next_hadiya_start_moment;
                    var s = String(raw).trim().replace(' ', 'T');
                    var hasTimezone = s.endsWith('Z') || /[\+\-]\d{2}:\d{2}$/.test(s) || /[\+\-]\d{4}$/.test(s);
                    var d;
                    if (hasTimezone) {
                        d = new Date(s);
                    } else {
                        var p = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
                        if (p) {
                            d = new Date(+p[1], +p[2]-1, +p[3], +p[4], +p[5], +(p[6]||0));
                        } else {
                            d = new Date(s);
                        }
                    }
                    if (!isNaN(d.getTime())) cutoffTime = d;
                }
                var isBeforeNextStart = cutoffTime && selectedDT && selectedDT.getTime() < cutoffTime.getTime();
                var correctMonday;
                if (isBeforeNextStart) {
                    var tmp = new Date(dateOnly + 'T00:00:00');
                    tmp.setDate(tmp.getDate() - 7);
                    correctMonday = fridayOf(formatLocalDate(tmp));
                } else {
                    correctMonday = fridayOf(dateOnly);
                }
                var adjDate = dateOnly;
                if (isBeforeNextStart) {
                    var sd = new Date(dateOnly + 'T00:00:00');
                    sd.setDate(sd.getDate() - 7);
                    adjDate = formatLocalDate(sd);
                }
                var monday = fridayOf(adjDate);
                if (!monday) { if (ok) ok({ error: "Invalid date." }); return; }
                var editable = monday === correctMonday;
                _supabase.from('weekly_status').select('member_id,member_name,status,completed_date_time,exception_raised_time,supported_by_name,support_status').eq('week_start', monday).then(function(rStat) {
                    if (!rStat.data || rStat.data.length === 0) {
                        _supabase.from('members').select('id,custom_id,name_en,name_ta,effective_date').order('custom_id', { ascending: true }).then(function(rMem) {
                            if (!rMem.data || rMem.data.length === 0) { if (ok) ok({ error: "No members found." }); return; }
                            var activeMem = filterActiveMembers(rMem.data, monday);
                            var reportList = activeMem.map(function(m) {
                                return { userId: m.id, name: (m.name_en||'')+' | '+(m.name_ta||''), status: 'Not Started', dateLogged: '', supportedBy: '', supportStatus: '', isEditable: editable };
                            });
                            if (ok) ok({ week: monday, data: reportList, isEditable: editable });
                        });
                        return;
                    }
                    _supabase.from('members').select('id,custom_id,name_en,name_ta,effective_date').order('custom_id', { ascending: true }).then(function(rMem) {
                        var activeMem = rMem.data ? filterActiveMembers(rMem.data, monday) : [];
                        var statMap = {};
                        rStat.data.forEach(function(s) { statMap[s.member_id] = s; });
                        var reportList = activeMem.map(function(m) {
                            var s = statMap[m.custom_id];
                            if (!s) {
                                return { userId: m.id, name: (m.name_en||'')+' | '+(m.name_ta||''), status: 'Not Started', dateLogged: '', supportedBy: '', supportStatus: '', isEditable: editable };
                            }
                            var dl = s.status === 'Completed' ? (s.completed_date_time || '') : (s.status === 'Exception Raised' ? (s.completed_date_time || s.exception_raised_time || '') : '');
                            return { userId: m.id, name: (m.name_en||'')+' | '+(m.name_ta||''), status: s.status||'Not Started', dateLogged: dl, supportedBy: s.supported_by_name||'', supportStatus: s.support_status||'', isEditable: editable };
                        });
                        if (ok) ok({ week: monday, data: reportList, isEditable: editable });
                    });
                });
            });
            return this;
        },
        // ----------------------------------------------------------------
        // updateWeeklyStatus
        // ----------------------------------------------------------------
        updateWeeklyStatus: function(userId, inputDateStr, statusUpdate, customTimestamp) {
            var self = this;
            var ok = _ok;
            try {
                var monday = normalizeToWeekStart(inputDateStr);
                if (!monday) { if (ok) ok({ success: false, error: 'Invalid date' }); return this; }
                var customId = null;
                resolveMemberCustomId(userId).then(function(resolvedCustomId) {
                    if (!resolvedCustomId) { if (ok) ok({ success: false, error: 'Member not found' }); return; }
                    customId = resolvedCustomId;
                    _supabase.from('weekly_status').select('*').eq('week_start', monday).eq('member_id', customId).single().then(function(rGet) {
                        var existing = rGet.data;
                        var nameEn = customId;
                        if (existing) nameEn = existing.member_name || customId;
                        var timestamp = (customTimestamp && customTimestamp.trim()) ? customTimestamp.trim() : formatCurrentTimestamp();
                        var cu = window.currentUser ? window.currentUser() : null;
                        var updaterEmail = cu ? (cu.name || 'Unknown') + ' (' + (cu.email || 'no-email') + ')' : 'Web User (Supabase)';
                        var oldStatus = existing ? existing.status : 'Not Started';
                        if (existing && existing.status === statusUpdate && !(customTimestamp && customTimestamp.trim())) {
                            if (ok) ok({ success: true, noChange: true }); return;
                        }
                        function doUpsert() {
                            var upsertData = {
                                week_start: monday, member_id: customId, member_name: nameEn,
                                status: statusUpdate, completed_date_time: null, exception_raised_time: null,
                                supported_by_name: '', supported_by_id: '', support_status: 'Reciting',
                                audit_log: existing ? (existing.audit_log || '') : ''
                            };
                            if (statusUpdate === 'Exception Raised') {
                                upsertData.exception_raised_time = timestamp;
                                upsertData.completed_date_time = existing ? existing.completed_date_time : null;
                                upsertData.supported_by_name = existing ? existing.supported_by_name : '';
                                upsertData.supported_by_id = existing ? existing.supported_by_id : '';
                                upsertData.support_status = existing ? (existing.support_status || 'Reciting') : 'Reciting';
                            } else if (statusUpdate === 'Completed') {
                                upsertData.completed_date_time = timestamp;
                                upsertData.exception_raised_time = null;
                                upsertData.supported_by_name = '';
                                upsertData.supported_by_id = '';
                                upsertData.support_status = '';
                            } else {
                                upsertData.completed_date_time = null;
                                upsertData.exception_raised_time = null;
                                upsertData.supported_by_name = '';
                                upsertData.supported_by_id = '';
                                upsertData.support_status = '';
                            }
                            var newLog = '[' + timestamp + ' - ' + updaterEmail + '] Modified Status from \'' + oldStatus + '\' to \'' + statusUpdate + '\'';
                            upsertData.audit_log = existing ? (existing.audit_log || '') + '\n' + newLog : newLog;
                            _supabase.from('weekly_status').upsert(upsertData, { onConflict: 'week_start,member_id' }).then(function(rUp) {
                                if (rUp.error) { if (ok) ok({ success: false, error: rUp.error.message }); return; }

                                var enName = (nameEn || '').split('|')[0].trim() || 'Unknown';
                                _supabase.from('members').select('name_ta').eq('id', userId).single().then(function(rTa) {
                                    var taName = rTa.data ? rTa.data.name_ta : enName;
                                    if (window.AppNotifications) {
                                        var nTitle = statusUpdate + ' - ' + enName + ' | ' + taName;
                                        var nBody = 'Sorgathin Pathai | Week ' + formatDateDDMMMYYYY(monday) + ' | ' + oldStatus + ' → ' + statusUpdate;
                                        var nBodyTa = 'ஜிகர் | வாரம் ' + formatDateDDMMMYYYY(monday) + ' | ' + oldStatus + ' → ' + statusUpdate;
                                        var updaterDisplay = cu ? (cu.name || 'Unknown') : 'Web User';
                                        var adminBody = nBody + '\n' + nBodyTa + '\nBy: ' + updaterDisplay;
                                        var notificationPromise = window.AppNotifications.insertToAllAdmins ? window.AppNotifications.insertToAllAdmins(nTitle, adminBody, true) : Promise.resolve();
                                        if (cu && cu.customId && cu.role !== 'admin') notificationPromise = notificationPromise.then(function() { return window.AppNotifications.insert(nTitle, nBody + '\n' + nBodyTa, cu.customId, 'user'); });
                                        if (customId && (!cu || cu.customId !== customId)) notificationPromise = notificationPromise.then(function() { return window.AppNotifications.notifyTargetUser ? window.AppNotifications.notifyTargetUser(nTitle, nBody + '\n' + nBodyTa, customId) : Promise.resolve(); });
                                        notificationPromise.then(function() { if (ok) ok({ success: true }); });
                                    } else if (ok) ok({ success: true });
                                });
                            });
                        }
                        if (cu && cu.role !== 'admin') {
                            var currentWeek = normalizeToWeekStart(new Date());
                            if (monday !== currentWeek) { if (ok) ok({ success: false, error: 'You can only update the current week.' }); return; }
                        }
                        if (cu && cu.role !== 'admin' && cu.customId !== customId) {
                            var _isSup = existing && String(existing.supported_by_id).length > 0;
                            if (_isSup) {
                                _supabase.from('members').select('id').eq('custom_id', cu.customId).maybeSingle().then(function(rMid) {
                                    if (!rMid.data || String(existing.supported_by_id) !== String(rMid.data.id)) {
                                        if (ok) ok({ success: false, error: 'Unauthorized' }); return;
                                    }
                                    doUpsert();
                                });
                                return;
                            } else {
                                if (ok) ok({ success: false, error: 'Unauthorized' }); return;
                            }
                        }
                        doUpsert();
                    });
                    return this;
                });
            } catch(err) { if (ok) ok({ success: false, error: err.toString() }); }
            return this;
        },
        // ----------------------------------------------------------------
        // updateSupportStatus
        // ----------------------------------------------------------------
        updateSupportStatus: function(userId, inputDateStr, newSupportStatus, customTimestamp) {
            var self = this;
            var ok = _ok;
            try {
                var monday = normalizeToWeekStart(inputDateStr);
                if (!monday) { if (ok) ok({ success: false, error: 'Invalid date' }); return this; }
                var customId = null;
                resolveMemberCustomId(userId).then(function(resolvedCustomId) {
                    if (!resolvedCustomId) { if (ok) ok({ success: false, error: 'Member not found' }); return; }
                    customId = resolvedCustomId;
                    _supabase.from('weekly_status').select('*').eq('week_start', monday).eq('member_id', customId).single().then(function(rGet) {
                        var existing = rGet.data;
                        if (!existing) { if (ok) ok({ success: false, error: 'Record not found' }); return; }
                        var timestamp = (customTimestamp && customTimestamp.trim()) ? customTimestamp.trim() : formatCurrentTimestamp();
                        var cu = window.currentUser ? window.currentUser() : null;
                        var updaterEmail = cu ? (cu.name || 'Unknown') + ' (' + (cu.email || 'no-email') + ')' : 'Web User (Supabase)';
                        var oldSupStatus = existing.support_status || 'None';
                        if (cu && cu.role !== 'admin') {
                            var currentWeek = normalizeToWeekStart(new Date());
                            if (monday !== currentWeek) { if (ok) ok({ success: false, error: 'You can only update the current week.' }); return; }
                            _supabase.from('members').select('id').eq('custom_id', cu.customId).maybeSingle().then(function(rMid) {
                                if (!rMid.data || String(existing.supported_by_id) !== String(rMid.data.id)) {
                                    if (ok) ok({ success: false, error: 'Unauthorized' }); return;
                                }
                                doSupportUpdate();
                            });
                            return;
                        }
                        doSupportUpdate();
                        function doSupportUpdate() {
                            var updateData = { support_status: newSupportStatus };
                            if (newSupportStatus === 'Completed') updateData.completed_date_time = timestamp;
                            else updateData.completed_date_time = null;
                            var newLog = '[' + timestamp + ' - ' + updaterEmail + '] Updated Support Status from \'' + oldSupStatus + '\' to \'' + newSupportStatus + '\'';
                            updateData.audit_log = (existing.audit_log || '') + '\n' + newLog;
                            _supabase.from('weekly_status').update(updateData).eq('week_start', monday).eq('member_id', customId).then(function(rUp) {
                                if (rUp.error) { if (ok) ok({ success: false, error: rUp.error.message }); return; }

                                var memberName = existing.member_name || '';
                                var enName = memberName.split('|')[0].trim() || memberName.trim();
                                var supportName = existing.supported_by_name || 'Support Reader';
                                var supEnName = supportName.split('|')[0].trim() || 'Support';
                                var readerId = existing.member_id;
                                var supId = existing.supported_by_id || '';
                                Promise.all([
                                    _supabase.from('members').select('name_ta').eq('custom_id', readerId).limit(1).then(function(r) { return { data: r.data && r.data.length > 0 ? r.data[0] : null }; }),
                                    supId ? _supabase.from('members').select('name_ta').eq('id', supId).single() : Promise.resolve({ data: null })
                                ]).then(function(results) {
                                    var readerTaName = results[0].data ? results[0].data.name_ta : enName;
                                    var supTaName = results[1].data ? results[1].data.name_ta : supEnName;
                                    if (window.AppNotifications) {
                                        var nTitle = (existing.status === 'Exception Raised' ? 'Support ' + newSupportStatus : 'Status Update') + ' - ' + enName + ' | ' + (typeof readerTaName !== 'undefined' ? readerTaName : '');
                                        var nBody = 'Sorgathin Pathai | Week ' + formatDateDDMMMYYYY(monday) + (existing.status === 'Exception Raised' ? ' | Support: ' + supEnName : '');
                                        var nBodyTa = 'ஜிகர் | வாரம் ' + formatDateDDMMMYYYY(monday) + (existing.status === 'Exception Raised' ? ' | உதவி: ' + (typeof supTaName !== 'undefined' ? supTaName : supEnName) : '');
                                        var notificationPromise = window.AppNotifications.insertToAllAdmins ? window.AppNotifications.insertToAllAdmins(nTitle, nBody + '\n' + nBodyTa, true) : Promise.resolve();
                                        if (cu && cu.customId && cu.role !== 'admin') notificationPromise = notificationPromise.then(function() { return window.AppNotifications.insert(nTitle, nBody + '\n' + nBodyTa, cu.customId, 'user'); });
                                        if (customId && (!cu || cu.customId !== customId)) notificationPromise = notificationPromise.then(function() { return window.AppNotifications.notifyTargetUser ? window.AppNotifications.notifyTargetUser(nTitle, nBody + '\n' + nBodyTa, customId) : Promise.resolve(); });
                                        notificationPromise.then(function() { if (ok) ok({ success: true }); });
                                    } else if (ok) ok({ success: true });
                                });
                            });
                        }
                    });
                    return this;
                });
            } catch(err) { if (ok) ok({ success: false, error: err.toString() }); }
            return this;
        },
        // ----------------------------------------------------------------
        // reassignSupport
        // ----------------------------------------------------------------
        reassignSupport: function(userId, inputDateStr, supportUserId) {
            var self = this;
            var ok = _ok;
            try {
                var monday = normalizeToWeekStart(inputDateStr);
                if (!monday) { if (ok) ok({ success: false, error: 'Invalid date' }); return this; }
                var customId = null;
                resolveMemberCustomId(userId).then(function(resolvedCustomId) {
                    if (!resolvedCustomId) { if (ok) ok({ success: false, error: 'Member not found' }); return; }
                    customId = resolvedCustomId;
                    _supabase.from('members').select('name_en,name_ta').eq('id', supportUserId).single().then(function(rSup) {
                        var supName = rSup.data ? (rSup.data.name_en || 'Support') + ' | ' + (rSup.data.name_ta || '') : 'Support Reader';
                        _supabase.from('weekly_status').select('*').eq('week_start', monday).eq('member_id', customId).single().then(function(rGet) {
                            var existing = rGet.data;
                            if (!existing) { if (ok) ok({ success: false, error: 'Record not found' }); return; }
                            var timestamp = formatCurrentTimestamp();
                            var cu = window.currentUser ? window.currentUser() : null;
                            var updaterEmail = cu ? (cu.name || 'Unknown') + ' (' + (cu.email || 'no-email') + ')' : 'Web User (Supabase)';
                            var updateData = {
                                supported_by_name: supName,
                                supported_by_id: supportUserId,
                                support_status: 'Reciting'
                            };
                            var newLog = '[' + timestamp + ' - ' + updaterEmail + '] Reassigned Support Reciting to: ' + supName + ' (Status: Reciting)';
                            updateData.audit_log = (existing.audit_log || '') + '\n' + newLog;
                            _supabase.from('weekly_status').update(updateData).eq('week_start', monday).eq('member_id', customId).then(function(rUp) {
                                if (rUp.error) { if (ok) ok({ success: false, error: rUp.error.message }); return; }

                                var memberName = existing.member_name || '';
                                var enName = memberName.split('|')[0].trim() || 'Unknown';
                                var supNames = (supName || '').split('|');
                                var supEnName = (supNames[0] || 'Support').trim();
                                var supTaName = (supNames[1] || supNames[0] || 'Support').trim();

                                _supabase.from('members').select('name_ta').eq('id', userId).single().then(function(rTa) {
                                    var taName = rTa.data ? rTa.data.name_ta : enName;
                                    if (window.AppNotifications) {
                                        var nTitle = 'Support Assigned - ' + enName + ' | ' + taName;
                                        var nBody = 'Sorgathin Pathai | Week ' + formatDateDDMMMYYYY(monday) + ' | Support: ' + supEnName;
                                        var nBodyTa = 'ஜிகர் | வாரம் ' + formatDateDDMMMYYYY(monday) + ' | உதவி: ' + supTaName;
                                        var updaterDisplay = cu ? (cu.name || 'Unknown') : 'Web User';
                                        var adminBody = nBody + '\n' + nBodyTa + '\nBy: ' + updaterDisplay;
                                        var notificationPromise = window.AppNotifications.insertToAllAdmins ? window.AppNotifications.insertToAllAdmins(nTitle, adminBody, true) : Promise.resolve();
                                        if (cu && cu.customId && cu.role !== 'admin') notificationPromise = notificationPromise.then(function() { return window.AppNotifications.insert(nTitle, nBody + '\n' + nBodyTa, cu.customId, 'user'); });
                                        if (customId && (!cu || cu.customId !== customId)) notificationPromise = notificationPromise.then(function() { return window.AppNotifications.notifyTargetUser ? window.AppNotifications.notifyTargetUser(nTitle, nBody + '\n' + nBodyTa, customId) : Promise.resolve(); });
                                        notificationPromise.then(function() { if (ok) ok({ success: true, assignedName: supName }); });
                                    } else if (ok) ok({ success: true, assignedName: supName });
                                });
                            });
                        });
                    });
                    return this;
                });
            } catch(err) { if (ok) ok({ success: false, error: err.toString() }); }
            return this;
        },
        // ----------------------------------------------------------------
        // updateHadiyaStatus
        // ----------------------------------------------------------------
        updateHadiyaStatus: function(selectedDate, newStatus) {
            var self = this;
            var ok = _ok;
            try {
                var friday = normalizeToFriday(selectedDate);
                if (!friday) { if (ok) ok({ success: false, error: 'Invalid date' }); return this; }
                _supabase.from('hadiya_details').select('start_date').lte('start_date', friday).order('start_date', { ascending: false }).limit(1).single().then(function(rGet) {
                    if (!rGet.data) { if (ok) ok({ success: false, error: 'Hadiya row not found' }); return; }
                    _supabase.from('hadiya_details').update({ status: newStatus }).eq('start_date', rGet.data.start_date).then(function(rUp) {
                        if (rUp.error) { if (ok) ok({ success: false, error: rUp.error.message }); return; }
                        var cu = window.currentUser ? window.currentUser() : null;
                        var updater = cu ? ((cu.name || 'Unknown') + (cu.email ? ' (' + cu.email + ')' : '')) : 'Web User';
                        var title = 'Hadiya status updated';
                        var body = 'Week ' + rGet.data.start_date + ' | Status: ' + newStatus + ' | Updated by ' + updater;
                        if (window.AppNotifications && window.AppNotifications.insertToAllAdmins) {
                            window.AppNotifications.insertToAllAdmins(title, body, true).then(function() { if (ok) ok({ success: true }); });
                        } else if (ok) ok({ success: true });
                    });
                });
            } catch(err) { if (ok) ok({ success: false, error: err.toString() }); }
            return this;
        },
        // ----------------------------------------------------------------
        // updateHadiyaDedication
        // ----------------------------------------------------------------
        updateHadiyaDedication: function(selectedDate, dedicationEn, dedicationTa, purposeEn, purposeTa) {
            var self = this;
            var ok = _ok;
            try {
                var friday = normalizeToFriday(selectedDate);
                if (!friday) { if (ok) ok({ success: false, error: 'Invalid date' }); return this; }
                _supabase.from('hadiya_details').select('start_date').lte('start_date', friday).order('start_date', { ascending: false }).limit(1).single().then(function(rGet) {
                    if (!rGet.data) { if (ok) ok({ success: false, error: 'Hadiya row not found' }); return; }
                    _supabase.from('hadiya_details').update({
                        dedicated_to: dedicationEn,
                        dedicated_to_ta: dedicationTa,
                        dedicated_purpose_english: purposeEn,
                        dedicated_purpose_tamil: purposeTa
                    }).eq('start_date', rGet.data.start_date).then(function(rUp) {
                        if (rUp.error) { if (ok) ok({ success: false, error: rUp.error.message }); return; }
                        if (ok) ok({ success: true });
                    });
                });
            } catch(err) { if (ok) ok({ success: false, error: err.toString() }); }
            return this;
        },
        // ----------------------------------------------------------------
        // updateHadiyaScheduleTimes
        // ----------------------------------------------------------------
        updateHadiyaScheduleTimes: function(startDate, deadlineISO, nextStartISO) {
            var self = this;
            var ok = _ok;
            try {
                if (!startDate) { if (ok) ok({ success: false, error: 'No start date provided' }); return this; }
                _supabase.from('hadiya_details').update({ countdown_end_moment: deadlineISO, next_hadiya_start_moment: nextStartISO }).eq('start_date', startDate).then(function(rUp) {
                    if (rUp.error) { if (ok) ok({ success: false, error: rUp.error.message }); return; }
                    if (ok) ok({ success: true, deadline: deadlineISO, nextStart: nextStartISO });
                }).catch(function(err) {
                    if (ok) ok({ success: false, error: 'Update failed: ' + (err.message || err) });
                });
            } catch(err) { if (ok) ok({ success: false, error: err.toString() }); }
            return this;
        },
        // ----------------------------------------------------------------
        // getAllMembers
        // ----------------------------------------------------------------
        getAllMembers: function() {
            var ok = _ok;
            _supabase.from('members').select('id,custom_id,name_en,name_ta,effective_date').order('custom_id', { ascending: true }).then(function(r) {
                if (r.error) { if (ok) ok([]); return; }
                if (ok) ok(r.data || []);
            });
            return this;
        },
        // ----------------------------------------------------------------
        // addMember
        // ----------------------------------------------------------------
        addMember: function(nameEn, nameTa, customId, effectiveDate) {
            var ok = _ok, err = _err;
            _supabase.from('members').insert({
                name_en: nameEn, name_ta: nameTa, custom_id: customId,
                effective_date: effectiveDate || null
            }).select('id').single().then(function(r) {
                if (r.error) { console.error('addMember members err', r.error); if (err) err(r.error); else if (ok) ok({ success: false, error: r.error.message }); return; }
                if (ok) ok({ success: true, id: r.data.id });
            });
            return this;
        },
        // ----------------------------------------------------------------
        // updateMember
        // ----------------------------------------------------------------
        updateMember: function(id, nameEn, nameTa, customId, effectiveDate) {
            var ok = _ok, err = _err;
            var cutDate = effectiveDate ? effectiveDate.slice(0,10) : new Date().toISOString().slice(0,10);
            _supabase.from('members').update({
                name_en: nameEn, name_ta: nameTa, custom_id: customId,
                effective_date: effectiveDate || null
            }).eq('id', id).then(function(r) {
                if (r.error) { console.error('updateMember members err', r.error); if (err) err(r.error); else if (ok) ok({ success: false, error: r.error.message }); return; }
                _supabase.from('weekly_status').update({ member_name: nameEn }).eq('member_id', customId).gte('week_start', cutDate).then(function(r2) {
                    if (r2.error) console.error('updateMember weekly_status err', r2.error);
                    if (ok) ok({ success: true });
                });
            });
            return this;
        },
        // ----------------------------------------------------------------
        // deleteMember
        // ----------------------------------------------------------------
        deleteMember: function(id) {
            var ok = _ok;
            _supabase.from('members').delete().eq('id', id).then(function(r) {
                if (r.error) { if (ok) ok({ success: false, error: r.error.message }); return; }
                if (ok) ok({ success: true });
            });
            return this;
        }
    };
    window.appApi = api;
})();
