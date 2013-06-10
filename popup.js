var baseAPIUrl = "http://api.cloudspokes.com/v1"
var baseUrl = "http://www.cloudspokes.com";
var challenges;
var leaderbord;
var payments;

function init() {
    console.log('init');
    //LoadFeed();

    // get the list of challenges
    $.ajax({
        url: baseAPIUrl + '/challenges?open=true&order_by=end_date&limit=25&offset=0',
        type: 'GET',
        success: function (data) {
            $('#loading').hide();
            $('#tbl-challenges tr');
            var html = '';
            data = data.response;
            challenges = data;
            // Iterate over the challenges and create HTML.
            for (var i = data.length - 1; i >= 0; i--) {
                // First tr will have challenge title and other small information.
                html += '<tr chid="' + data[i].challenge_id + '" class="challenge-summary">' +
                            '<td><a href="' + baseUrl + '/challenges/' + data[i].challenge_id + '" target="_blank">' + data[i].name +
                                '</a><span class ="newchallenge" style="display:' + is_2hour_Older(data[i].start_date) + '" >new</span>' +
                                '<br/><div class="technologies" style="font-size:x-small">' + joinCategories(data[i].challenge_technologies__r) + '</div>' +
                             '</td>' +
                             '<td>' + formatDay(data[i].days_till_close) + '</td>' +
                             '<td>$' + data[i].total_prize_money + '</td></tr>';

                // This tr will contain extra information abt challenge and will be shown when first tr is clicked.
                html += '<tr style="display:none" class="tr-chmoreDetails"> <td colspan="3"> <div class="ch-description">' + data[i].description + '</div></td> </tr>'
            }

            //Insert html into DOM after header row.
            $('#tbl-challenges tr').first().after(html);

            // Click event on challenge to get more info about challenge.
            $('.challenge-summary').click(function () {
                if ($(this).attr('hasParticipant') != 'true') {
                    var chid = $(this).attr("chid");
                    $("tr[chid=" + chid + "]").attr('hasParticipant', 'true');

                    $.ajax({
                        url: baseAPIUrl + '/challenges/' + chid + '/participants?challenge_id=' + chid,
                        type: 'GET',
                        success: function (result) {
                            data = result.response;

                            var html = '<b>Participants (' + result.count + ')</b><br/>';

                            // Create HTML for showing participant list.
                            for (var i = 0; i < data.length; i++) {
                                html += '<div class="participant-info">' +
                                            '<img src="' + data[i].member__r.profile_pic + '" title="' + data[i].member__r.name + '- ' + data[i].member__r.country + '"/>' +
                                            ' ' + data[i].status + '<span title="total money/total wins">$' + data[i].member__r.total_public_money + '/' + data[i].member__r.total_wins + ' </span>' +
                                         '</div>';
                            }
                            // Add the data in DOM.
                            $("tr[chid=" + chid + "]").next().find('td').append(html);
                        }
                    });
                }

                // This line does the animation for show/hide additional challenge information.
                $(this).next().toggle(300);
            });
        }
    });

    // get the leaderboard
    $.ajax({
        url: baseAPIUrl + '/leaderboard?period=month&limit=10',
        type: 'GET',
        success: function (data) {
            $('#tbl-leaderboard tr');
            var html = '';
            data = data.response;
            leaderbord = data;

            for (var i = 0; i < data.length; i++)
                html += '<tr index=' + i + '><td width="10">' + data[i].rank + '</td><td width="55"><img src="' + data[i].profile_pic + '" width="50"></td><td><a href="' + baseUrl + '/members/' + data[i].username + '" target="_blank">' + data[i].username + '</a><br><div style="font-size:x-small">' + data[i].country + '</div></td><td>$' + Math.floor(data[i].total_money) + '</td></tr>';
            $('#tbl-leaderboard tr').first().after(html);
        }
    });

    // get payments
    $.ajax({
        url: baseUrl + '/account/payment-info.json',
        type: 'GET',
        success: function (dataResponse) {
            $('#tbl-payments tr');
            var html = '';
            var data = dataResponse.paid;
            payments = dataResponse;

            for (var i = data.length - 1; i >= 0; i--)
                html += '<tr><td>' + data[i].name + '</td><td>' + data[i].challenge.name + '</td><td>' + data[i].place + '</td><td>$' + Math.floor(data[i].money) + '</td><td>' + data[i].reason + '</td><td>' + data[i].status + '</td><td>' + data[i].payment_sent + '</td><td>' + data[i].reference_number + '</td></tr>';
            //$('#tbl-payments tr').not(':first').remove();
            $('#tbl-payments tr').first().after(html);

            data = dataResponse.outstanding;
            for (var i = data.length - 1; i >= 0; i--)
                html += '<tr><td>' + data[i].name + '</td><td>' + data[i].challenge.name + '</td><td>' + data[i].place + '</td><td>$' + Math.floor(data[i].money) + '</td><td>' + data[i].reason + '</td><td>' + data[i].status + '</td><td>' + data[i].payment_sent + '</td><td>' + data[i].reference_number + '</td></tr>';

            $('#tbl-payments tr').first().after(html);
        }
    });

    document.body.style.width = "600px";
    $('#challengesLink').click();

    // quick find functionality.
    $('#quickfind').keyup(function () {
        // Hide the more detail section if open any.
        $('.tr-chmoreDetails').hide();

        var searchterm = $(this).val();
        if (searchterm.length > 1) {
            $('.technologies').each(function (index) {
                if ($(this).text().toUpperCase().indexOf(searchterm.toUpperCase()) != -1) {
                    $(this).parent().parent().show();
                } else {
                    $(this).parent().parent().hide();
                }
            });
        } else $('.challenge-summary').show();
    });
}

function formatDay(days) {
    if (days == 0) {
        return " today!";
    } else if (days == 1) {
        return " 1 day";
    } else {
        return days + " days";
    }
}

function joinCategories(categories) {
    var joined = "";
    var counter = 0;
    for (var i = 0; i < categories.records.length; i++) {
        joined = joined + categories.records[i].name;
        if (counter < categories.records.length - 1)
            joined = joined + ', ';
        counter++;
    }
    return joined;
}

function toggle(event) {
    var section = $(this).attr('id');

    console.log('toggle:' + section);
    // hide everything
    if (section == "challengesLink") {
        showChallenges();
        hideLeaderboard();
        hidePayments();
        document.body.style.width = "600px";
    } else if (section == "leaderboardLink") {
        showLeaderboard();
        hideChallenges();
        hidePayments();
        document.body.style.width = "600px";
    } else if (section == "paymentsLink") {
        showPayments();
        hideChallenges();
        hideLeaderboard();
        document.body.style.width = "800px";
    }
}

function hideChallenges() {
    document.getElementById("challenges").style.display = "none";
    document.getElementById("challenges").style.visibility = "hidden";
}

function showChallenges() {
    document.getElementById("challenges").style.display = "block";
    document.getElementById("challenges").style.visibility = "visible";
}

function hideLeaderboard() {
    document.getElementById("leaderboard").style.display = "none";
    document.getElementById("leaderboard").style.visibility = "hidden";
}

function showLeaderboard() {
    document.getElementById("leaderboard").style.display = "block";
    document.getElementById("leaderboard").style.visibility = "visible";
}

function hidePayments() {
    document.getElementById("payments").style.display = "none";
    document.getElementById("payments").style.visibility = "hidden";
}

function showPayments() {
    document.getElementById("payments").style.display = "block";
    document.getElementById("payments").style.visibility = "visible";
}

function openWin(page) {
    gotoUrl = baseUrl + '/' + page;
    window.open(gotoUrl);
}

// utility function
// Simple function to calculate time difference between 2 Javascript date objects
function get_time_difference(earlierDate, laterDate) {
    var nTotalDiff = laterDate.getTime() - earlierDate.getTime();
    var oDiff = new Object();

    oDiff.days = Math.floor(nTotalDiff / 1000 / 60 / 60 / 24);
    nTotalDiff -= oDiff.days * 1000 * 60 * 60 * 24;

    oDiff.hours = Math.floor(nTotalDiff / 1000 / 60 / 60);
    nTotalDiff -= oDiff.hours * 1000 * 60 * 60;

    oDiff.minutes = Math.floor(nTotalDiff / 1000 / 60);
    nTotalDiff -= oDiff.minutes * 1000 * 60;

    oDiff.seconds = Math.floor(nTotalDiff / 1000);

    return oDiff;
}

function is_2hour_Older(createdDate) {
    var diff = get_time_difference(new Date(createdDate), new Date());
    if (diff.days == 0 && diff.hours < 23)
        return 'inline';
    else return 'none';
}

// Code for Feed burner.
var feedUrl = 'http://feeds.feedburner.com/SforceBlog?format=xml';
var maxFeedItems = 2;

function LoadFeed() {
    req = new XMLHttpRequest();
    req.onload = handleResponse;
    req.onerror = handleError;
    req.open("GET", feedUrl, true);
    req.send(null);

    document.getElementById("docsSection").style.display = "block";
    document.getElementById("docsSection").style.visibility = "visible";
}

// handles errors during the XMLHttpRequest.
function handleError() {
    alert('Failed to fetch RSS feed.');
}

// handles parsing the feed data we got back from XMLHttpRequest.
function handleResponse() {
    var doc = req.responseXML;
    if (!doc) {
        handleFeedParsingFailed("Not a valid feed.");
        return;
    }
    parseEntry(doc);
}

function parseEntry(doc) {
    var entries = doc.getElementsByTagName('entry');
    if (entries.length == 0) {
        entries = doc.getElementsByTagName('item');
    }
    var count = Math.min(entries.length, maxFeedItems);
    for (var i = 0; i < count; i++) {
        item = entries.item(i);

        // Grab the title for the feed item.
        var itemTitle = item.getElementsByTagName('title')[0];
        if (itemTitle) {
            itemTitle = itemTitle.textContent;
        } else {
            itemTitle = "Get a Free Developer Edition";
        }

        // Grab the url for the feed item.
        var itemUrl = item.getElementsByTagName('link')[0];
        if (itemUrl) {
            itemUrl = itemUrl.getAttribute('href');
        } else {
            itemUrl = "http://www.developer.force.com";
        }

        // Grab the description.
        var itemDesc = item.getElementsByTagName('description')[0];
        if (!itemDesc) {
            itemDesc = item.getElementsByTagName('summary')[0];
            if (!itemDesc) {
                itemDesc = item.getElementsByTagName('content')[0];
            }
        }
        if (itemDesc) {
            itemDesc = itemDesc.childNodes[0].nodeValue;
        } else {
            itemDesc = 'Learn to develop in the cloud.';
        }
    }

    if (itemDesc.length > 150)
        itemDesc = itemDesc.substring(0, 150) + "....";

    document.getElementById("feedUrl").href = itemUrl;
    document.getElementById("feedUrl").innerHTML = itemTitle;
    feedDesc.innerText = itemDesc;
}

$(document).ready(function () {
    init();
    $('#paymentsLink,#challengesLink,#leaderboardLink').click(toggle);
});