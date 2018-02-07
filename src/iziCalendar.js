(function ($) {
	$.fn.iziCalendar = function (options) {
        var prefix = randomString() + "-";
        var width = 0;
		var startdate = "";
		var days = ["MÅN", "TIS", "ONS", "TOR", "FRE", "LÖR", "SÖN"];
		var selecteddays = [];
        var colors = {
            "transparent":["transparent","gray","whitesmoke"],
            "orange":["orange","white","orange"],
            "blue":["#51b1e7","white","deepskyblue"],
            "green":["forestgreen","white","greenyellow"],
            "red":["indianred","white","orangered"],
            "pink":["hotpink","white","lightpink"],
            "purple":["mediumpurple","white","rebeccapurple"],
            "selectedcell":["whitesmoke","black","whitesmoke"]
        };
		var daysFull = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];
		var months = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
		var obj = [];
		var settings = $.extend({
			getUrl: "",
			deleteUrl: "",
			locale: "sv",
			saveUrl: "",
			//editable: true,
			selectable: true,
			singleSelect: false,
			singleSelectWithTime: false,
			outputStartElements: [],
			outputEndElements: []
        }, options);
        width = $(this).width() / 7;
		$(this).html("<div id=\"" + prefix + "\" class=\"calendarContainer iziCalendar\" style=\"background-color:white\"><input type=\"text\" id=\"" + prefix + "intervalstartdate\" style=\"display:none\" /><input type=\"text\" id=\"" + prefix + "intervalenddate\" style=\"display:none\" /><table style=\"margin-bottom: 1em;border-collapse: separate;border-spacing: 0 1px;margin: 0;width: 100%\"><tr><td style=\"text-align:left\"><a class=\"navigateCalendar\" id=\"" + prefix + "back\"></a></td><td style=\"text-align:center\" id=\"" + prefix + "SelectedDate\"></td><td style=\"text-align:right\"><a class=\"navigateCalendar\" id=\"" + prefix + "next\"></a></td></tr><table><div id=\"" + prefix + "MonthCalendarContainer\"><table style=\"border-collapse: separate;border-spacing: 0 1px;margin: 0;width: 100%\" id=\"" + prefix + "MonthCalendar\"></table><div style=\"clear:both\"></div><div id=\"" + prefix + "SelectedDayContainer\"></div></div> <div id=\"" + prefix + "DayCalendarContainer\"><div id=\"" + prefix + "DayCalendar\"></div></div></div></div>");
        $("#" + prefix + "MonthCalendar").html(getMonthCalendar());
        
		reloadMonthCalendar(getDateString(new Date()));


		$("#" + prefix + " .navigateCalendar").click(function () {
			var d = $(this).attr("href").replace("#", "");
			if (d.length > 7) {
				//ReloadDayCalendar(date);
			}
			else {
				reloadMonthCalendar(d);
			}
		});

		$(document).on("click", "." + prefix + "timecontainerdelbtn", function () {
			$(this).closest(".choosetimecontainer").remove();
		});
		$(document).on("click", "." + prefix + "singleselectdelbtn", function () {
			var con = $(this).closest(".singleselectvaluecontainer");
			var date = con.find(".singleselectdate").html();
			delFromOutputElements(date);
			function isDate(item){
				return item!==date;
			}
			selecteddays = selecteddays.filter(isDate);
			var sd = $("#" + prefix + " a[href=\"#" + date + "\"]");
			if (sd.length > 0){
                sd.parent().css("background-color",colors["transparent"][0]);
                sd.parent().removeClass("selectedcell");
            }
            
			$(this).closest(".singleselectvaluecontainer").remove();
		});
        $(window).resize(function() {
            width = $(this).width()/7;
            var styles = {
                width : width+"px",
                height: width/1.6+"px",
                lineHeight:width/1.6+"px",
                padding:0,
                margin:1+"px"
              };
            $("#"+prefix+" .calendarcell").css(styles);
        });
		$(document).on("click", "." + prefix + "savestartendtimebtn", function () {
			var con = $(this).closest(".choosetimecontainer");
			var date = con.find(".selecteddate").val();
			var starttime = con.find(".starttime").val();
			var endtime = con.find(".endtime").val();
			var d1 = date + " " + starttime;
			var d2 = date + " " + endtime;
			var d3 = d1 + "," + d2;
			selecteddays.push(date);
            setOutputElements(settings.outputStartElements, d3);
            con.parent().find("a").parent().css("background-color",colors["selectedcell"][0]);
            con.parent().find("a").parent().addClass("selectedcell");
			con.remove();
		});
		if (settings.selectable) {
			$(document).on("click", "#" + prefix + " .calendarcell a", function () {
				var date = $(this).attr("href").replace("#", "");
				var dateAsDate = new Date(date);
				var startAsDate = new Date();
				var first = false;
				if (!settings.singleSelect && (selecteddays.length > 1 || selecteddays.length === 0)) {
                    $(".calendarcell").removeClass("selectedcell");
                    $(".calendarcell").css("background-color",colors["transparent"][0]);
					selecteddays = [];
					selecteddays.push(date);
					first = true;
					setOutputElements(settings.outputStartElements, date);
					setOutputElements(settings.outputEndElements, "");
					$("#" + prefix + "intervalstartdate").val(date);
					$("#" + prefix + "intervalenddate").val("");
				}
				else {
                    startAsDate = new Date(selecteddays[0]);
                    if(!settings.singleSelect){
                        if (dateAsDate < startAsDate)
						    return;
                    }
				}
				if (settings.singleSelect) {
					if (settings.singleSelectWithTime) {
						$(".choosetimecontainer").remove();
						if ($(this).parent().hasClass("selectedcell")) return;
						$(this).parent().append("<div class=\"choosetimecontainer\" style=\"line-height:20px;position: absolute;width: 200px;border: 0.8px solid lightgray;padding: 10px; background-color: whitesmoke;\"><div style=\"text-align:right\"><button style=\"background-color:transparent;border:0;margin:0;padding:0;cursor:pointer\" class=\""+ prefix + "timecontainerdelbtn\"><svg style=\"width:24px;height:24px\" viewBox=\"0 0 24 24\"><path fill=\"gray\" d=\"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z\" /></svg></button></div><div style=\"text-align:center\">Välj start & sluttid</div><hr /><div style=\"text-align:center\"><select class=\"form-control starttime\">" + getClocks(true) + "</select> - <select class=\"form-control endtime\">" + getClocks(false) + "</select><hr /><input type=\"hidden\" class=\"selecteddate\" value=\"" + date + "\" /></div><button style=\"margin-top:5px\" class=\"btn btn-block " + prefix + "savestartendtimebtn\">Spara</button></div>");
					}
					else {
                        if ($(this).parent().hasClass("selectedcell")) return;
                        selecteddays.push(date);
						setOutputElements(settings.outputStartElements, date);
					}
				}
				else {
					if (selecteddays.length === 1 && !first) {
						var d = new Date(selecteddays[0]);
						while (d < dateAsDate) {
							d = addDays(d, 1);
							selecteddays.push(getDateString(d));
						}
						setOutputElements(settings.outputEndElements, date);
						$("#" + prefix + "intervalenddate").val(date);
					}
				}
				if (!settings.singleSelectWithTime)
					for (var i = 0; i < selecteddays.length; i++) {
						console.log(selecteddays[i]);
						var sd = $("#" + prefix + " a[href=\"#" + selecteddays[i] + "\"]");
						if (sd.length > 0 && !sd.parent().hasClass("selectedcell")){
                            sd.parent().css("background-color",colors["selectedcell"][0]);
                            sd.parent().addClass("selectedcell");
                        }
					}
			});
		}
		function addDays(date, days) {
			var result = new Date(date);
			result.setDate(date.getDate() + days);
			return result;
		}
		function getDateString(d) {
			return d.getFullYear() + "-" + getNumberString(d.getMonth() + 1) + "-" + getNumberString(d.getDate());
		}
		function getClocks(start) {
			var ss = [];
			for (var i = 0; i < 24; i++) {
				for (var j = 0; j < 60; j = j + 15) {
					var s = getNumberString(i) + ":" + getNumberString(j);
					var selected = "";
					if (((start && i === 8) || (!start && i === 17)) && j === 0) {
						selected = " selected=\"selected\"";
					}
					ss.push("<option value=\"" + s + "\"" + selected + ">" + s + "</option>");
				}
			}
			return ss.join("");
		}
		function getMonthCalendar() {
			var ss = [];
			ss.push("<tr>");
			for (var i = 0; i < 7; i++) {
				ss.push("<th style=\"text-align:center; font-size:0.8em;font-weight:300\">" + days[i] + "</th>");
			}
			ss.push("</tr>");
			var r = 1;
			for (var j = 0; j < 6; j++) {
				ss.push("<tr>");
				for (var q = 0; q < 7; q++) {
					ss.push("<td class=\"calendarcell\" style=\"padding:0;margin: 1px;width:"+width+"px;height:"+width/1.6+"px;line-height:"+width/1.6+"px\"><a href=\"#\" id=\"" + prefix + r + "\" style=\"text-decoration: none;color: gray;display: block;height:100%;text-align:center\" onMouseOver=\"this.style.backgroundColor='#f5f5f5'\" onMouseOut=\"this.style.backgroundColor='transparent'\"></a></td>");
					r++;
				}
				ss.push("</tr>");
			}
			return ss.join("");
		}
		function getNumberString(s) {
			if (s < 10)
				return "0" + s;
			return s;
		}
		function reloadMonthCalendar(d) {
			var dd = new Date(d);
			dd.setDate(1);
            reloadCal(d);
			if ($("#userid").length > 0 && settings.getUrl != "")
				$.getJSON(settings.getUrl + $("#userid").val() + "?date=" + $("#" + prefix + "1").attr("href").replace("#", ""))
					.done(function (o) {
						for (var q = 0; q < o.length; q++) {
							obj.push(o[q]);
						}
						setAppointment();
					})
					.fail(function (jqxhr, textStatus, error) {
						var err = textStatus + ", " + error + "," + jqxhr;
						alert("Request Failed: " + err);
					});

		}
		function removePrefix(str) {
			return str.replace(prefix, "");
		}
		function reloadCal(dd) {
            var dt = colors["transparent"];
            $(".calendarcell").css("background-color",dt[0]);
            $(".calendarcell a").css("color",dt[1])
			$(".calendarcell").removeClass("selectedcell");
			$(".calendarcell").removeClass("izicalendar-red");
			$(".calendarcell").removeClass("izicalendar-green");
			$(".calendarcell").removeClass("izicalendar-blue");
			$(".calendarcell").removeClass("izicalendar-orange");
			$(".calendarcell").removeClass("izicalendar-pink");
			$(".calendarcell").removeClass("izicalendar-purple");
			var d = new Date(dd);
			var n = new Date(dd);
			var b = new Date(dd);
			n.setMonth(d.getMonth() + 1);
			b.setMonth(d.getMonth() - 1);
			d.setDate(1);
			var firstday = d.getDay();
			if (firstday === 0)
				firstday = 7;
			var i = 1;
			var q = 1;
			var r = 1;
			var occ = 0;
			var fullNext = n.getFullYear() + "-" + getNumberString(n.getMonth() + 1);
			var fullBack = b.getFullYear() + "-" + getNumberString(b.getMonth() + 1);
			var currentDate = d.getFullYear() + "-" + getNumberString(d.getMonth() + 1);
			$("#" + prefix + "next").html("<svg style=\"width:24px;height:24px\"><path fill=\"#000000\" d=\"M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z\" /></svg>");
			$("#" + prefix + "next").attr("href", "#" + fullNext);
			$("#" + prefix + "back").html("<svg style=\"width:24px;height:24px\"><path fill=\"#000000\" d=\"M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z\" /></svg>");// + " " + months[b.getMonth()]);
			$("#" + prefix + "back").attr("href", "#" + fullBack);
			$("#" + prefix + "SelectedDate").html(months[d.getMonth()] + ", " + d.getFullYear());
			$("#" + prefix + " .calendarcell a").each(function () {
				if ($(this).hasClass("not-in-selected-month")){
                    $(this).removeClass("not-in-selected-month");
                    $(this).css("color","gray")
                }
					
				var t = false;
				var dt = currentDate + "-" + getNumberString(i);
				var id = removePrefix($(this).attr("id"));
				if (id === firstday.toString()) {
					$(this).html(i);
					i++;
				} else if (id > firstday) {
					var dddd = new Date(dd);
					dddd.setDate(i);
					if (dddd.getMonth() === d.getMonth()) {
						$(this).html(i);
						i++;
					} else {
						$(this).html(q);
						t = true;
						dt = fullNext + "-" + getNumberString(q);
						q++;
					}
				} else {
					var ddd = new Date(dd);
					t = true;
					ddd.setDate((r - firstday) + 1);
					dt = fullBack + "-" + ddd.getDate();
					$(this).html(ddd.getDate());
					r++;
				}

				$(this).attr("href", "#" + dt);
				if (selecteddays.indexOf(dt) > -1){
                    $(this).parent().css("background-color",colors["selectedcell"][0]);
                    $(this).parent().addClass("selectedcell");
                }
					
				if (t){
                    $(this).css("color","lightgray")
                    $(this).addClass("not-in-selected-month");
                }
					
			});
		}
		function setAppointment() {
			$("#" + prefix + " .calendarcell a").each(function () {
				$(this).attr("title", "");
				var id = removePrefix($(this).attr("href")).replace("#", "");
				var t = -1;

				if (obj != null && obj.length > 0) {
					var e = getAppointmentFromDate(id);
					var res = e !== undefined && e !== null ? e.Status : -1;
					if (res > -1) {
						t = res;
						$(this).attr("title", e.Name + ": " + e.StartDate + ", " + e.StartTime + "-" + e.EndTIme);
					}
				}
				var c = "transparent";

				switch (t) {
					case 1:
						c = "orange";
						break;
					case 2:
						c = "blue";
						break;
					case 3:
						c = "red";
						break;
					case 4:
						c = "pink";
						break;
					case 5:
						c = "green";
						break;
					case 7:
						c = "purple";
						break;
                }
                
                if ($(this).hasClass("not-in-selected-month")){
                    $(this).removeClass("not-in-selected-month");
                }
              
                $(this).parent().addClass("izicalendar-"+c);
                if(c!=="transparent")
                $(this).css("color",colors[c][1])
				$(this).parent().css("background-color",colors[c][0]);
			});
		}
		function getAppointmentTypeFromDate(d) {
			var e = getAppointmentFromDate(d);
			return e !== undefined && e !== null ? e.Status : -1;
		}
		function getAppointmentFromDate(dd) {
			var d = new Date(dd);
			for (var i = 0; i < obj.length; i++) {
				var s = new Date(obj[i].StartDate);
				var e = new Date(obj[i].EndDate);
				if (s.getTime() === d.getTime() || (d > s && d <= e)) {
					return obj[i];
				}
			}
			return null;
		}
		function getTimeFromDate(d) {
			var s = d.split(" ");
			return s[1];
		}
		function getDateFromDate(d) {
			var s = d.split(" ");
			return s[0];
		}
		function setOutputElements(outputElements, value) {
			if (outputElements.length > 0) {
				for (var i = 0; i < outputElements.length; i++) {
					var element = $("#" + outputElements[i]);
					if (element.length > 0) {
						if (element.is("input")) {
							if (settings.singleSelect)
								element.val(element.val() + "," + value);
							else
								element.val(value);
						}
						else {
							if (settings.singleSelect)
								element.append(getValueContainer(value));
							else {
								element.html("<span class=\"intervalselectdate\">" + value + "</span>");
							}
						}
					}
				}
			}
		}
		function delFromOutputElements(value) {
			if (!settings.singleSelect) return;
			if (settings.outputStartElements.length > 0) {
				for (var i = 0; i < settings.outputStartElements.length; i++) {
					var element = $("#" + settings.outputStartElements[i]);
					if (element.length > 0) {
						if (element.is("input")) {
							var s = element.val().split(",");
							var ss = [];
							for (var j = 0; j < s.length; j++) {
								if (s[j].indexOf(value) < 0) {
									ss.push(s[j]);
								}
							}
							element.val(ss.join(","));
						}
					}
				}
			}
		}
		function getValueContainer(value) {
			var starttime = "";
			var endtime = "";
			var date = value;
			var splitter = "";
			var timesContainer = "";
			if (settings.singleSelectWithTime) {
				splitter = " - ";
				var d = value.split(",");
				date = getDateFromDate(d[0]);
				starttime = getTimeFromDate(d[0]);
				endtime = getTimeFromDate(d[1]);
				timesContainer = " <span class=\"singleselectstarttime\">" +
					starttime +
					"</span><span>" +
					splitter +
					"</span> <span class=\"singleselectendtime\">" +
					endtime +
					"</span>";
            }
			return "<div class=\"singleselectvaluecontainer\" style=\"margin-bottom: 2px;padding: 1em;background-color: white;border: 1px solid lightgray;\"><button style=\"background-color:transparent;border:0;margin:0;padding:0 2em 0 0;vertical-align:middle;cursor:pointer\" title=\"Ta bort post\" class=\""+ prefix + "singleselectdelbtn\"><svg style=\"width:24px;height:24px\" viewBox=\"0 0 24 24\"><path fill=\"gray\" d=\"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z\" /></svg></button><span class=\"singleselectdate\">" + date + "</span>" + timesContainer + "</div>";
		}
		function randomString() {
			var charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			var rs = [];
			for (var i = 0; i < 5; i++) {
				var randomPoz = Math.floor(Math.random() * charSet.length);
				rs.push(charSet.substring(randomPoz, randomPoz + 1));
			}
			return rs.join("");
		}
		return this;
	};
}(jQuery));

