var apiKey = '1a9709178ee9dd9a2ba64da5856ceda6';
var ipKey = 'b4cf109c7b587e';
let currentDate = new Date();
let dayString = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
let currentObject = {};
let forecastObject = {};
let preciseLocation = false;
let data = {};
let savedFavs = [];
$(init);
const search = (cityString, stateString) => {
    if(cityString == '' && stateString == '') {
    }
    else if(cityString == '' && stateString != ''){
        let url = `https://api.openweathermap.org/data/2.5/weather?q=${stateString}&units=imperial&appid=${apiKey}`;
        getCurrentWeather(url, false);
    }
    else if(cityString != '' && stateString == ''){
        let url = `https://api.openweathermap.org/data/2.5/weather?q=${cityString}&units=imperial&appid=${apiKey}`;
        getCurrentWeather(url, false);
    }
    else if(cityString != '' && stateString != ''){
        let url = `https://api.openweathermap.org/data/2.5/weather?q=${cityString},${stateString}&units=imperial&appid=${apiKey}`;
        getCurrentWeather(url, false);
    }
    $('#cityText').val('');
    $('#stateText').val('');
}
const clickSearch = (id) => {
    let url = `https://api.openweathermap.org/data/2.5/weather?id=${id}&units=imperial&appid=${apiKey}`;
    getCurrentWeather(url, false);
}
const getPosition = () => {
    return new Promise (function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}
const currentWeatherReject = () => {
    preciseLocation = false;
}

const setDisplay = (data, currentLoc) => {
    currentObject = data;
    if(currentObject.name != undefined){
        setCurrent(currentObject.name, currentObject.id, currentLoc);
    }
    let icon = `http://openweathermap.org/img/wn/${currentObject.weather[0].icon}@2x.png`;
    $('#locHead').html(currentObject.name);
    let currentDiv =

    `<strong>Today</strong><br>
    ${currentObject.main.temp}&degF<br>
    <img src=${icon}><br>
    ${currentObject.weather[0].description}
    `

    $('.current').html(currentDiv);
    getForecast(currentObject.coord.lat, currentObject.coord.lon);
}
const getCurrentWeather = (url, myLoc) => {
    fetch(url).then(
        (response) => {
            return response.json();
        },
    currentWeatherReject).then(
        (data) => {
        setDisplay(data, myLoc);
        }).catch(function(e){
        alert(`invalid location, ${e}`);
    })
}
const forecastReject = () => {
    $('.forecastDiv').html("Forecast Fetch Failed");
}
const getForecast = (lat, lon) => {
    let oneCallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly&appid=${apiKey}`;
    fetch(oneCallUrl).then(
        (response) => {
            return response.json();
        }, forecastReject).then(
        (data) => {
            forecastObject = data;
            let fDivs = $('.forecastDiv');
            for(let i = 0; i < fDivs.length; i++){
                let forecastDay = new Date();
                forecastDay.setDate(currentDate.getDate() + i + 1);
                let icon = `http://openweathermap.org/img/wn/${forecastObject.daily[i + 1].weather[0].icon}@2x.png`;
                $(fDivs[i]).html(
                    `<strong>${dayString[forecastDay.getDay()]}</strong>
                    <img class='forecastIcon' src=${icon}>
                    <span style='bottom:0px; position:absolute'>${forecastObject.daily[i + 1].temp.day}&degF</span>`
                );
            }
        }
    );
}

function init(){
    let ipUrl = `https://ipinfo.io?token=${ipKey}`;
    fetch(ipUrl).then(
        (response) => response.json()
    ).then(
        (obj) => {
            let coords = JSON.stringify(obj.loc).replaceAll('"', '').split(',');
            let url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords[0]}&lon=${coords[1]}&units=imperial&appid=${apiKey}`;
            getCurrentWeather(url, true);
        }
    ).catch(function(e) {
        console.log(e);
    });
    savedFavs = JSON.parse(window.localStorage.getItem('favorites'));
    for(let x = 0; x < savedFavs.length; x++){
        let spanEl = document.createElement('span');
        $(spanEl).addClass('emptyHeart');
        $(spanEl).addClass('fullHeart');
        $(spanEl).html('&#9829;');
        $(spanEl).attr('tabindex', 0);
        let liEl = document.createElement('li');
        $(liEl).addClass('loc');
        $(liEl).data('heart', true);
        $(liEl).data('location', savedFavs[x].location);
        $(liEl).data('id', savedFavs[x].id);
        $(liEl).attr('tabindex', 0);
        $(liEl).html(`${savedFavs[x].location}&emsp;`);
        $(liEl).append(spanEl);
        $(liEl).css('display', 'none');
        $('#favLoc').prepend(liEl);
        $(liEl).slideToggle();
        $(liEl).keypress(function(e) {
            if(e.code === 'Enter'){
                let cancel = false;
                e.stopPropagation();
                if($('#recentLoc').children('.loc:first').data('id') == $(this).data('id')) {
                    cancel = true;
                }
                if(!deleting && !cancel && !focusBool){
                    clickSearch($(this).data('id'));
                }
            }
        });
    }
}

let focusBool = false;

$('.hoverObj').click(function() {
    if(!focusBool){
        $('#focusDivHolder').css('display', 'block');
        let focusObj = $(this).clone();
        let num = focusObj[0].id;
        $(focusObj).html('');
        setTimeout(function() {
            fillDiv(focusObj, num);
        }, 500);
        $(focusObj).addClass('focusDiv');
        $(focusObj).removeClass('hoverObj');
        $('#focusDivHolder').append(focusObj);
        focusBool = true;
    }
});

$('#focusDivHolder').on('click', '.focusDiv', function() {
    $('#focusDivHolder').css('display', 'none');
    focusBool = false;
    $('.focusDiv').remove();
})

$('#searchButton').click(function() {
    if(!focusBool){
        search($('#cityText').val(), $('#stateText').val());
    }
});

$('#searchDiv').keypress(function(e){
    if(e.code == "Enter" && !focusBool){
        search($('#cityText').val(), $('#stateText').val());
    }
});


$('#cats').on('mouseover', '.loc', function(e) {
    e.stopPropagation();
    if(!$(this).children().hasClass('fullHeart')){
        $(this).children('.emptyHeart').html('&#9825;');
    }
});

$('#cats').on('mouseout', '.loc', function(e) {
    e.stopPropagation();
    if($(this).data('heart') == false){
        $(this).children('.emptyHeart').html('');
    }
});

let deleting = false;

$('#cats').on('click', '.loc', function(e) {
    let cancel = false;
    e.stopPropagation();
    if($('#recentLoc').children('.loc:first').data('id') == $(this).data('id')) {
        cancel = true;
    }
    if(!deleting && !cancel && !focusBool){
        clickSearch($(this).data('id'));
    }
});

$('#cats').on('mouseover', '.emptyHeart', function(e) {
    e.stopPropagation();
    if($(this).parent().data('heart') == false){
        $(this).addClass('fullHeart');
        $(this).html('&#9829;');
    }
});

$('#cats').on('mouseout', '.emptyHeart', function(e){
    e.stopPropagation();
    if($(this).parent().data('heart') == false){
        $(this).removeClass('fullHeart');
        $(this).children('.emptyHeart').html('&#9825;');
    }
});

$('#cats').on('click', '.emptyHeart', function(e) {
    e.stopPropagation();
    let locs = $('#cats').find('.loc');
    if($(this).parent().data('heart') === false){
        for(let x of locs){
            if($(x).data('location') == $(this).parent().data('location') && !$(x).is($(this).parent())){
                $(x).data('heart', true);
                let el = $(x).children('span');
                $(el).addClass('fullHeart');
                $(el).html('&#9829;');
            }
        }
        $(this).addClass('fullHeart');
        $(this).html('&#9829;');
        $(this).parent().data('heart', true);
        let fav = $(this).parent().clone(true);
        $(fav).css('display', 'none');
        $('#favLoc').prepend(fav);
        $(fav).slideToggle();
        if($('#favLoc').children('.loc').length == 5){
            for(let y of locs){
                if(($(y).data('id') == $('#favLoc').children('.loc:last').data('id')) && (!$(y).is($('#favLoc').children('loc:last')))){
                    $(y).data('heart', false);
                    $(y).children('.emptyHeart').removeClass('fullHeart');
                    $(y).children('.emptyHeart').html('');
                }
            }
            del($('#favLoc').children('.loc:last'));
        }
        setFavorites();
    } else {
        for(let x of locs){
            if($(x).data('location') == $(this).parent().data('location') && !$(x).is($(this).parent())){
                let el = $(x).children('span');
                $(el).removeClass('fullHeart');
                $(el).html('');
                $(x).data('heart', false);
                if($(x).parent().attr('id') == 'favLoc'){
                    del($(x));
                }
            }
        }
        $(this).removeClass('fullHeart');
        $(this).html('');
        $(this).parent().data('heart', false);
        if($(this).parent().parent().attr('id') == 'favLoc'){
            del($(this).parent());
        }
    }
});

const setFavorites = () => {
    let tempFavs = [];
    let favs = $('#favLoc').children('.loc');
    for(let i = 0; i < $(favs).length; i++){
        if(i < 4){
            tempFavs[i] = {
                'location': $(favs[i]).data('location'),
                'id': $(favs[i]).data('id'),
            };
        }
    }
    let myJson = JSON.stringify(tempFavs);
    window.localStorage.setItem('favorites', myJson);
}
$('#preciseButton').click((event) => {
    event.preventDefault();
    if(!preciseLocation){
        preciseLocation = true;
        getPosition().then(
            (response) => {
                let url = `https://api.openweathermap.org/data/2.5/weather?lat=${response.coords.latitude}&lon=${response.coords.longitude}&units=imperial&appid=${apiKey}`;
                getCurrentWeather(url, true);
                $('#preciseButton').fadeOut();
                $('#ip').fadeOut();
            },
        currentWeatherReject);
    }
});

$('.arrow').click(function() {
    $(this).toggleClass('downArrow');
    $(this).parent().children('.nest').slideToggle();
});

const del = (obj) => {
    $(obj).slideToggle();
    deleting = true;
    setTimeout(function() {
        $(obj).remove();
        deleting = false;
        setFavorites();
    }, 500);
}

const setCurrent = (loc, id, current) => {
    let shuffle = false;
    let spanEl = document.createElement('span');
    $(spanEl).addClass('emptyHeart');
    $(spanEl).attr('tabindex', 0);
    let liEl = document.createElement('li');
    $(liEl).attr('tabindex', 0);
    $(liEl).addClass('loc');
    $(liEl).data('heart', false);
    $(liEl).data('location', loc);
    $(liEl).data('id', id);
    $(liEl).html(`${loc}&emsp;`);
    $(liEl).append(spanEl);
    $(liEl).keypress(function(e) {
        if(e.code == "Enter" && !focusBool){
            let cancel = false;
            e.stopPropagation();
            if($('#recentLoc').children('.loc:first').data('id') == $(this).data('id')) {
                cancel = true;
            }
            if(!deleting && !cancel && !focusBool){
                clickSearch($(this).data('id'));
            }
        }
    });

    let recentLocs = $('#recentLoc').find('.loc');
    for(let x of recentLocs){
        if(($(x).data('location') == $(liEl).data('location')) && !($(x).is($(liEl)))){
            del($(x));
            shuffle = true;
        }
    }
    let favLocs = $('#favLoc').find('.loc');
    for(let x of favLocs){
        if($(x).data('location') == $(liEl).data('location')){
            $(spanEl).addClass('fullHeart');
            $(spanEl).html('&#9829;');
            $(liEl).data('heart', true);
        }
    }

    let copy = $(liEl).clone(true);
    $(copy).prependTo('#recentLoc');
    $(copy).slideToggle();
    if(current){
        $(liEl).prependTo('#currentLoc');
        $(liEl).slideToggle();
    }

    if($('#currentLoc').children('.loc').length == 2){
        del($('#currentLoc').children('.loc:last'));
    }
    if($('#recentLoc').children('.loc').length == 4 && !shuffle){
        del($('#recentLoc').children('.loc:last'));
    }
}
$('.textBox').on('mousedown', function() {
    $(this).css('background', '#cccccc');
});
$('.textBox').on('mouseup', function() {
    $(this).css('background','');
});
$('.textBox').on('mouseout', function() {
    $(this).css('background', '');
});
const fillDiv = (div, num) => {
    if($(div).hasClass('current')){
        let icon = `http://openweathermap.org/img/wn/${currentObject.weather[0].icon}@2x.png`;
        $(div).html(`
        <strong style='font-size:21pt'>Today's Weather</strong><br>
        ${currentObject.weather[0].main}<br>
        <img class='icon' src=${icon}>
        (${currentObject.weather[0].description})<br><br>
        <strong>-Temperature-</strong><br>
        ${currentObject.main.temp}&degF<br>
        (Feels Like ${currentObject.main.feels_like}&degF)<br>
        High: ${currentObject.main.temp_max}&degF<br>
        Low: ${currentObject.main.temp_min}&degF<br><br>
        <strong>-Humidity-</strong><br>
        ${currentObject.main.humidity}%
        `);
    }
    else{
        let obj = forecastObject.daily[parseInt(num)];
        let icon = `http://openweathermap.org/img/wn/${obj.weather[0].icon}@2x.png`;
        let thisDate = new Date();
        thisDate.setDate(currentDate.getDate() + parseInt(num));
        let day = dayString[thisDate.getDay()];
        $(div).html(`
        <strong style='font-size:21pt'>${day}'s Weather</strong><br>
        ${obj.weather[0].main}<br>
        <img class='icon' src=${icon}>
        (${obj.weather[0].description})<br><br>
        <strong>-Temperature-</strong><br>
        Day: ${obj.temp.day}&degF<br>
        Night: ${obj.temp.eve}&degF<br>
        High: ${obj.temp.max}&degF<br>
        Low: ${obj.temp.min}&degF<br><br>
        <strong>-Humidity-</strong><br>
        ${obj.humidity}%
        </br>`);
    }
}
