window.onload = function(){
    const urlParams = new URLSearchParams(window.location.search);
    const param1 = urlParams.get('param1');

    let valg1 = document.getElementById('bolig1')
    let valg2 = document.getElementById('bolig2')

    valg1.addEventListener('change', () => boligvalg(valg1.value, '1'))
    valg2.addEventListener('change', () => boligvalg(valg2.value, '2'))

    addOptions()

    if(param1 !== null){
        boligvalg(param1, '1')
    }
}

function addOptions(){
    fetch('https://api.npoint.io/eb3c116538e7dcbfc7bf/listings/')
    .then(response => response.json())
    .then(data => {
        const boligliste = Object.values(data); //converts to array

        boligliste.forEach(listing => {
            const valg1 = document.getElementById('bolig1')
            const valg2 = document.getElementById('bolig2')

            const option1 = document.createElement('option');
            option1.value = listing.id;
            option1.innerText = listing.title;

            const option2 = option1.cloneNode(true); // unngår samme node i begge

            valg1.appendChild(option1);
            valg2.appendChild(option2);
        })
    })
}

function boligvalg(id, index){
    fetch(`https://api.npoint.io/eb3c116538e7dcbfc7bf/listings/${id}`)
    .then(response => response.json())
    .then(data => {
        //Picture for the hero
        //Picture for the hero
        const bigimg = `
            <img class="bigimg1" src="${data.media.images[0]}" alt="bigimg1">
        `
        document.getElementById('bigimg'+index).innerHTML = '' //deletes previous image
        document.getElementById('bigimg'+index).insertAdjacentHTML('beforeend', bigimg)

        const miniimages = `
            <img src="${data.media.images[0]}" alt="img1-1">
            <img src="${data.media.images[1]}" alt="img2-1">
            <img src="${data.media.images[2]}" alt="img3-1">
            <img src="${data.media.floorPlan}" alt="img4-1">
        `
        document.getElementById('miniimg'+index).innerHTML = '' //deletes previous images
        document.getElementById('miniimg'+index).insertAdjacentHTML('beforeend', miniimages)


        //hero txt and stars
        document.getElementById('type'+index).innerHTML = data.type
        document.getElementById('price'+index).innerHTML = `${data.pricePerMonth} kr/mnd`
        
        const adrandplace = `
            <img src="Bilder/placepin.svg" alt="plass">
            <p>${data.address.city}</p>
        `
        document.getElementById('adrplace'+index).innerHTML = '' //fjerner tidligere
        document.getElementById('adrplace'+index).insertAdjacentHTML('beforeend', adrandplace)

        if(document.getElementById('bolig'+index).value !== ''){
            document.getElementById('bolig'+index).src = "Bilder/placepin.svg"
        }

        const sociability = Number(data.socialEnvironment.scores.sociability)
        const agreeability = Number(data.socialEnvironment.scores.agreeability)
        const friendliness = Number(data.socialEnvironment.scores.friendliness)

        const score = Math.round(((agreeability + friendliness + sociability)/3)/2)
        
        let stjerner = []

        for (let s=1; s<=5; s++) {
            if (s<=score) {
                stjerner.push('staryes.png')
            }else {
                stjerner.push('stargrey.svg')
            }
        }

        document.getElementById('star'+index).innerHTML = '' //fjerner tidligere stjerner

        const starsreview = `${stjerner.map(star => `<img src="Bilder/${star}" alt="stjerne">`).join('')}`
        document.getElementById('star'+index).insertAdjacentHTML('beforeend', starsreview)
    
        //Information about the housing
        document.getElementById('boliginfo'+index).innerHTML = '' //fjerner tidligere elementer

        let kitchen = ''
        let bathroom = ''
        let furnitures = ''

        if(data.housingConditions.privateKitchen === "true"){
            kitchen = 'Eget kjokken'
        }else {kitchen = 'Delt kjokken'}

        if(data.housingConditions.privateBathroom === "true"){
            bathroom = 'Eget bad'
        }else {bathroom = 'Delt bad'}

        if(data.housingConditions.isFurnished === "true"){
            furnitures = 'Moblert'
        }else {furnitures = 'Ikke moblert'}

        const housingInfo = `
            <h2 class="bold">Boligtype</h2>
            <p><img src="Bilder/areal.svg" alt="areal">${data.housingConditions.sizeSqm} m<sup>2<sup></p>
            <p><img src="Bilder/bathroom.svg" alt="bad">${bathroom}</p>
            <p><img src="Bilder/kitchen.svg" alt="kjokken">${kitchen}</p>
            <p><img src="Bilder/sofasvart.svg" alt="sofa">${furnitures}</p>
            <p><img src="Bilder/placepin.svg" alt="plass">${data.address.street} ${data.address.house_number}, ${data.address.postcode} ${data.address.city}</p>
        `

        document.getElementById('boliginfo'+index).insertAdjacentHTML('beforeend', housingInfo)
        
        //Fasilities
        document.getElementById("tittelfas").innerHTML = 'FASILITETER'

        let bicycle = false;
        let shop = false;
        let washing = false;
        let gym = false;
        let distanceToCity = false;
        let furnished = false;

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
                furnished = true
            }
        }
        const fasiliteter = {
            sykkelbod: bicycle,
            butikknaer: shop,
            vaskeri: washing,
            gymnaer: gym,
            kortavstand: distanceToCity,
            ermoblert: furnished,
            id: 'fasility'+index,
        }

        addFasilities(fasiliteter, index)

        //avstand sentrum
        const placement = document.getElementById('beliggenhet'+index);
        placement.innerHTML = ''

        const placementInfo = `
            <h2 class="bold">Beliggenhet</h2>
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2965.1450437310855!2d5.330048856722229!3d60.386349921265776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x463cfc04e96f5a39%3A0xda17ce282c8e9338!2sMedieklyngen%20AS!5e0!3m2!1sno!2sno!4v1744445625970!5m2!1sno!2sno" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            <p>Boligen ligge ${data.housingConditions.distanceToCityCentre} km fra sentrum</p>
            <br>
            <p>
                Sol lucet super montes altos.
                <br>
                Discipuli in bibliotheca diligenter legunt.
                <br>
                Aqua clara in flumine celeriter fluit
            </p>
        `

        placement.insertAdjacentHTML('beforeend', placementInfo)

        //naboer
        const neighborInfo = document.getElementById('naboer'+index)
        neighborInfo.innerHTML = '' //fjerner tidligere elementer

        const neighborTitle = `<h2 class="bold" textspace8>Naboer</h2>`
        neighborInfo.insertAdjacentHTML('beforeend', neighborTitle)

        data.socialEnvironment.neighbors.forEach(nabo => {
            const contentNeighbor = `
                <div class=infonaboer>
                    <img src="Bilder/profil.svg" alt="profilbilde">
                    <div class="nabotxt">
                        <p>${nabo.age} aar, studerer ${nabo.studyField}</p>
                        <p>Interesser: ${nabo.interests.map(tag => `${tag}, `).join('')}</p>
                    </div>
                </div>
            `

            neighborInfo.insertAdjacentHTML('beforeend', contentNeighbor)
        });

    })
}

function addFasilities(data, index) {
    const fasiliteter = document.getElementById('fasility'+index)
    fasiliteter.innerHTML = '' //removes elements from before

    if(data.sykkelbod == true){
        const sykkelikon = `
            <div class="fasilitetericon">
                <img src="Bilder/bicycle.svg" alt="bicycle"><br>
                <p>Sykkelparkering</p>
            <div>
        `
        fasiliteter.insertAdjacentHTML('beforeend', sykkelikon)
    }
    if(data.butikknaer == true){
        const butikkikon = `
            <div class="fasilitetericon">
                <img src="Bilder/Shoppingbag.svg" alt="butikk">
                <p>Naer butikk</p>
            </div>
        `
        fasiliteter.insertAdjacentHTML('beforeend', butikkikon)
    }
    if(data.vaskeri == true){
        const vaskikon = `
            <div class="fasilitetericon">
                <img src="Bilder/washingmachine.svg" alt="vask">
                <p>Vaskeri</p>
            </div>
        `

        fasiliteter.insertAdjacentHTML('beforeend', vaskikon)
    }
    if(data.gymnaer == true){
        const gymikon = `
            <div class="fasilitetericon">
                <img src="Bilder/gym.svg" alt="gym">
                <p>Gym</p>
            </div>
        `

        fasiliteter.insertAdjacentHTML('beforeend', gymikon)
    }
    if(data.kortavstand == true){
        const avstandikon = `
            <div class="fasilitetericon">
                <img src="Bilder/walk.svg" alt="gym">
                <p>Gangavtsand til<br>sentrum</p>
            </div>
        `

        fasiliteter.insertAdjacentHTML('beforeend', avstandikon)
    }
    if(data.ermoblert == true){
        const moblerikon = `
            <div class="fasilitetericon">
                <img src="Bilder/sofa.svg" alt="sofa">
                <p>Moblert</p>
            </div>
        `

        fasiliteter.insertAdjacentHTML('beforeend', moblerikon)
    }
}

function detaljer1(){
    const valg1 = document.getElementById('bolig1')
    const id = valg1.value
    const link = 'specifics.html' + '?param1=' + id
    window.open(link, '_self')
}

function detaljer2(){
    const valg2 = document.getElementById('bolig2')
    const id = valg2.value
    const link = 'specifics.html' + '?param1=' + id
    window.open(link, '_self')
}