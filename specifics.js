window.onload = function(){
    const urlParams = new URLSearchParams(window.location.search);
    const param1 = urlParams.get('param1');

    addHero(param1);
    addmoreinfo(param1);
}

function addHero(id) {
    fetch(`https://api.npoint.io/eb3c116538e7dcbfc7bf/listings/${id}`)
    .then(response => response.json())
    .then(data => {
        //change picture in carousel
        document.getElementById('img1').src = data.media.images[0];
        document.getElementById('img2').src = data.media.images[1];
        document.getElementById('img3').src = data.media.images[2];
        document.getElementById('imgfloor').src = data.media.floorPlan;

        //adds text to hero txt
        const title = document.getElementById('title');
        title.innerHTML = `${data.address.city} - ${data.type}`

        const adr = document.getElementById('address');
        adr.innerHTML = `${data.address.street} ${data.address.house_number} ${data.address.appartment}, ${data.address.postcode}`
    
        //change info in infoblocks
        let bathroom = ''
        let kitchen = ''
        let furnitures = ''

        if (data.housingConditions.privateBathroom === "true"){
            bathroom = 'Eget bad'
        }else {
            bathroom = 'Delt bad'
        }

        if(data.housingConditions.privateKitchen === "true"){
            kitchen = 'Eget kjokken'
        }else {
            kitchen = 'Delt kjokken'
        }

        if(data.housingConditions.isFurnished === "true"){
            furnitures = 'Moblert'
        }else {
            furnitures = 'Ikke moblert'
        }

        const infoData = {
            areal: data.housingConditions.sizeSqm,
            bad: bathroom,
            kjokken: kitchen,
            moblert: furnitures,
            pris: data.pricePerMonth,
        }

        addInfoData(infoData)

        //adds info about the neighbors
        for (let p=0; p<data.socialEnvironment.neighbors.length; p++){
            const person = data.socialEnvironment.neighbors[p]

            const interests = []

            for (let i=0; i<person.interests.length; i++) {
                interests.push(person.interests[i])
            }

            const farger = ['manblue.svg', 'manred.svg', 'manyellow.svg', 'manlightgreen.svg']

            const neighbourData = {
                age: person.age,
                interest: interests,
                year: person.studyYear,
                field: person.studyField,
                farge: farger[p],
            }

            addNeighbor(neighbourData)

        }

        //Graf på scores - Highcharts (small changes)
        Highcharts.chart('container', {
            exporting: { //fjerner hamburgermeny
                enabled: false,
            },
        
            credits: { //fjerner creditering
                enabled: false,
            },
            
            chart: {
                type: 'solidgauge',
                height: 320, //endrer høyde på grafen
                events: {
                    render: renderIcons
                }
            },
        
            tooltip: {
                backgroundColor: 'none',
                fixed: true,
                pointFormat: '{series.name}<br>' +
                    '<span style="font-size: 2em; color: {point.color}; ' +
                    'font-weight: bold">{point.y}</span>',
                position: {
                    align: 'center',
                    verticalAlign: 'middle'
                },
                style: {
                    fontSize: '12px'
                },
                valueSuffix: '%'
            },
        
            title: {
                text: null,
                style: {
                  fontSize: "24px",
                },
            },
              
            pane: {
                startAngle: 0,
                endAngle: 360,
        
                background: [{ //Biggest circle
                    outerRadius: '112%',
                    innerRadius: '88%',
                    backgroundColor: 'rgba(53, 125, 189, 0.2)',
                    borderWidth: 0
                }, { // medium
                    outerRadius: '87%',
                    innerRadius: '63%',
                    backgroundColor: 'rgba(248, 87, 85, 0.2)',
                    borderWidth: 0
                }, { // smallets
                    outerRadius: '62%',
                    innerRadius: '38%',
                    backgroundColor: 'rgba(40, 164, 101, 0.2)',
                    borderWidth: 0
                }]
            },
        
            yAxis: {
                min: 0,
                max: 100,
                lineWidth: 0,
                tickPositions: []
            },
        
            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        enabled: false
                    },
                    linecap: 'round',
                    stickyTracking: false,
                    rounded: true
                }
            },
        
            series: [{
                name: 'Sociability',
                data: [{
                    color: Highcharts.getOptions().colors[0],
                    radius: '112%',
                    innerRadius: '88%',
                    y: Number(data.socialEnvironment.scores.sociability)*10
                }],
            }, {
                name: 'Agreeability',
                data: [{
                    color: Highcharts.getOptions().colors[1],
                    radius: '87%',
                    innerRadius: '63%',
                    y: Number(data.socialEnvironment.scores.agreeability)*10
                }],
            }, {
                name: 'Friendliness',
                data: [{
                    color: Highcharts.getOptions().colors[2],
                    radius: '62%',
                    innerRadius: '38%',
                    y: Number(data.socialEnvironment.scores.friendliness)*10
                }],
            }]
        });
    });    
}

function addmoreinfo(id) {
    fetch(`https://api.npoint.io/eb3c116538e7dcbfc7bf/listings/${id}`)
    .then(response => response.json())
    .then(data => {
        //fasilities
        let bicycle = false;
        let shop = false;
        let washing = false;
        let gym = false;
        let distanceToCity = false;
        let furnituresIncluded = false;

        for (let i=0; i<data.housingConditions.infrastructure.length; i++){
            const fasilitet = data.housingConditions.infrastructure[i]

            if(fasilitet == "gym"){
                gym = true
            }
            if(fasilitet == "bike_shed"){
                bicycle = true
            }
            if(fasilitet == "supermarket_nearby"){
                shop = true
            }
            if(fasilitet == "laundry"){
                washing = true
            }
            if(Number(data.housingConditions.distanceToCityCentre) <= 2.5){
                distanceToCity = true
            }

            if(data.housingConditions.isFurnished == "true"){
                furnituresIncluded = true
            }
        }
        const fasiliteter = {
            sykkelbod: bicycle,
            butikknaer: shop,
            vaskeri: washing,
            gymnaer: gym,
            kortavstand: distanceToCity,
            ermoblert: furnituresIncluded,
        }

        addFasilities(fasiliteter)

        //More photos
        const moreImages = document.getElementById('flerebilder');

        data.media.images.forEach(link => {
            const nyttbilde = `<img src="${link}" alt="flerebilder">`
            moreImages.insertAdjacentHTML('beforeend', nyttbilde)
        })

        //Adds reviews
        data.reviews.forEach(pers => {
            const reviewsList = document.getElementById('andmeld');

            const review = `
                <div class="reviewstxt">
                    <div class="topreviews">
                        <h4 class="bold textspace8">${pers.year}, ${pers.authorStudyField}</h4>
                        <div class="starreviews">
                            <img src="Bilder/staryes.png" alt="star">
                            <img src="Bilder/staryes.png" alt="star">
                            <img src="Bilder/staryes.png" alt="star">
                            <img src="Bilder/staryes.png" alt="star">
                            <img src="Bilder/stargrey.svg" alt="star">
                        </div><br>
                    </div>
                    <p class="textspace8">Studert i ${pers.authorYearOfStudy} aar</p>
                    <p>${pers.comment}</p>
            `

            reviewsList.insertAdjacentHTML('beforeend', review)
        })
    })
}

function addInfoData(data) {
    const boliginfo = document.getElementById('boliginfo');
    boliginfo.innerHTML = '';

    const info = `
        <p class="textspace24"><img src="Bilder/areal.svg" alt="areal">${data.areal} m<sup>2<sup></p>
        <p class="textspace24"><img src="Bilder/bathroom.svg" alt="bad">${data.bad}</p>
        <p class="textspace24"><img src="Bilder/kitchen.svg" alt="kjokken">${data.kjokken}</p>
        <p class="textspace24"><img src="Bilder/leilighet.svg" alt="leilighet">${data.moblert}</p>
        <p><img src="Bilder/price.svg" alt="pris">${data.pris} kr/mnd</p>
    `;

    boliginfo.insertAdjacentHTML('beforeend', info);
    
}

function addNeighbor(data) {
    const nabo = `
        <div>
            <p><img src="Bilder/${data.farge}" alt="mann">${data.age} aar Studie: ${data.field}, ${data.year}. aar \n
            Interesser: ${data.interest.map(tag => `${tag} `).join('')}</p>
        </div>
    `;
    
    const naboer = document.getElementById('naboer');
    naboer.insertAdjacentHTML('beforeend', nabo);
}

function addFasilities(data){
    const fasiliteter = document.getElementById('fasilitetsliste')
    if(data.sykkelbod == true){
        const sykkelikon = `
            <div class="fasilityicon">
                <img src="Bilder/bicycle.svg" alt="bicycle"><br>
                <h4>Sykkelparkering</h4>
            <div>
        `
        fasiliteter.insertAdjacentHTML('beforeend', sykkelikon)
    }
    if(data.butikknaer == true){
        const butikkikon = `
            <div class="fasilityicon">
                <img src="Bilder/Shoppingbag.svg" alt="butikk">
                <h4>Naer butikk</h4>
            </div>
        `
        fasiliteter.insertAdjacentHTML('beforeend', butikkikon)
    }
    if(data.vaskeri == true){
        const vaskikon = `
            <div class="fasilityicon">
                <img src="Bilder/washingmachine.svg" alt="vask">
                <h4>Vaskeri</h4>
            </div>
        `

        fasiliteter.insertAdjacentHTML('beforeend', vaskikon)
    }
    if(data.gymnaer == true){
        const gymikon = `
            <div class="fasilityicon">
                <img src="Bilder/gym.svg" alt="gym">
                <h4>Gym</h4>
            </div>
        `

        fasiliteter.insertAdjacentHTML('beforeend', gymikon)
    }
    if(data.kortavstand == true){
        const avstandikon = `
            <div class="fasilityicon">
                <img src="Bilder/walk.svg" alt="gym">
                <h4>Gangavtsand til<br>sentrum</h4>
            </div>
        `

        fasiliteter.insertAdjacentHTML('beforeend', avstandikon)
    }
    if(data.ermoblert == true){
        const moblerikon = `
            <div class="fasilityicon">
                <img src="Bilder/sofa.svg" alt="sofa">
                <h4>Moblert</h4>
            </div>
        `

        fasiliteter.insertAdjacentHTML('beforeend', moblerikon)
    }
}

function compare() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramid = urlParams.get('param1');
    const link = 'comparison.html' + '?param1=' + paramid;
    window.open(link, '_self');
}

//Highcharts
/**
 * In the chart render event, add icons on top of the circular shapes
 */
function renderIcons() {

    this.series.forEach(series => {
        if (!series.icon) {
            series.icon = this.renderer
                .text(
                    `<i class="fa fa-${series.options.custom.icon}"></i>`,
                    0,
                    0,
                    true
                )
                .attr({
                    zIndex: 10
                })
                .css({
                    color: series.options.custom.iconColor,
                    fontSize: '1.5em'
                })
                .add(this.series[2].group);
        }
        series.icon.attr({
            x: this.chartWidth / 2 - 15,
            y: this.plotHeight / 2 -
                series.points[0].shapeArgs.innerR -
                (
                    series.points[0].shapeArgs.r -
                    series.points[0].shapeArgs.innerR
                ) / 2 +
                8
        });
    });
}

const trackColors = Highcharts.getOptions().colors.map(color =>
    new Highcharts.Color(color).setOpacity(0.3).get()
);

Highcharts.setOptions({
    colors: ['#357DBD', '#F85755', '#28A465'], // Eksempel: oransje, blå, grønn
  });
