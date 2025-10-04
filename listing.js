window.onload = function() {
    addCards();
};

function getWetRoomType(house) {
    if (house.housingConditions.privateBathroom == house.housingConditions.privateKitchen) {
        if (house.housingConditions.privateBathroom) {
            return 'Eget bad og kjokken'
        }else {
            return 'Delt bad og kjokken'
        }
    }else {
        if (house.housingConditions.privateBathroom) {
            return 'Eget bad, delt kjokken'
        }else {
            return'Delt bad, eget kjokken'
        }
    }
}

//finds the tags and adds them to the list
function getTags(listing) {
    tags = []
    if (listing.provider === 'external') {
        tags.push('Privat')
    }else {
        tags.push('Studentskipnad')
    }

    for (let u=0; u<listing.housingConditions.infrastructure.length; u++) {
        tags.push(listing.housingConditions.infrastructure[u])
    }

    tags = tags.slice(-3)

    tags = tags.map(tag => tag.replace(/_/g, ' '))

    return tags
}

function getStars(listing) {
    let stars = []
    
    const agreeabilityScore = Number(listing.socialEnvironment.scores.agreeability)
    const friendlinessScore = Number(listing.socialEnvironment.scores.friendliness)
    const sociabilityScore = Number(listing.socialEnvironment.scores.sociability)

    const score = Math.round(((agreeabilityScore + friendlinessScore + sociabilityScore)/3)/2)

    for (let s=1; s<=5; s++) {
        if (s<=score) {
            stars.push('staryes.png')
        }else {
            stars.push('stargrey.svg')
        }
    }

    return stars
}

function addCards() {
    fetch('https://api.npoint.io/eb3c116538e7dcbfc7bf/listings/')
    .then(response => response.json())
    .then(data => {
        const listings = Object.values(data)

        for (let i=0; i<listings.length; i++) {
            const listing = listings[i];

            let cardData = {
                link: 'specifics.html'+'?param1='+listing.id,
                image: listing.media.images[0],
                tags: getTags(listing),
                type: listing.type,
                pris: listing.pricePerMonth,
                place: `${listing.address.city}, ${listing.address.street}`,
                badogkjokken: getWetRoomType(listing),
                kvm: listing.housingConditions.sizeSqm,
                avstand: Math.round(listing.housingConditions.distanceToCityCentre),
                starslist: getStars(listing),

            }

            createCard(cardData)
        }
    })
    .catch(err => {
        console.error("Feil under lasting av kort:", err)});
}

function createCard(data) {
    //Makes template for a card
    const cardHTML = `
        <a href="${data.link}">
            <div class="card">
                <div>
                    <div class="imgandctg">
                        <img src="${data.image}" alt="Photo og housing">
                        <div class="imgcategories">
                            <nav>
                                ${data.tags.map(tag => `<li><p class="label" style="color: #006647">${tag}</p></li>`).join('')}
                            </nav>
                        </div>
                    </div>
                    <div class="alltxt">
                        <div class="spacing">
                            <div><h4>${data.type}</h4></div>
                            <div><h4>${data.pris} kr/mnd</h4></div>
                        </div>
                        <div class="together">
                            <img src="Bilder/leilighet.svg" alt="leilighet">
                            <p style="color: rgba(0, 0, 0, 0.75);;">${data.place}</p>
                        </div>
                    </div>
                    <div class="infoandstars">
                        <div>
                            <p class="info">${data.badogkjokken} | ${data.kvm} m<sup>2</sup> | Sentrum: ${data.avstand}km</p>
                        </div>
                        <div class="stars">
                            ${data.starslist.map(star => `<img src="Bilder/${star}" alt="stjerne">`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </a>
    `;

    const listings = document.getElementById('listings');
    listings.insertAdjacentHTML('beforeend', cardHTML) //Adds the card to the end
}

function filterCards() {
    fetch('https://api.npoint.io/eb3c116538e7dcbfc7bf/listings/')
    .then(response => response.json())
    .then(data => {
        const housings = Object.values(data)

        const type = document.getElementById('boligtype').value
        const pris = document.getElementById('pris').value
        const utleier = document.getElementById('utleier').value
        const str = document.getElementById('storrelse').value
        const bad = document.getElementById('bad').value
        const kjokken = document.getElementById('kjokken').value

        document.getElementById('listings').innerHTML = ''

        if (type=='' && pris=='' && utleier=='' && str=='' && bad=='' && kjokken==''){
            addCards()
            return
        }

        let priceMax = 0
        let priceMin = 0

        if (pris == 1) {
            priceMax = 4500
            priceMin = 0
        }else if(pris == 2) {
            priceMax = 6500
            priceMin = 4500
        }else if(pris == 3) {
            priceMax = 7500
            priceMin = 6500
        }else if (pris == 4) {
            priceMin = 7500
            priceMax = 100000
        }


        let maxSize = 0
        let minSize = 0

        if (str == 1){
            maxSize = 15
            minSize = 0
        }else if(str == 2){
            maxSize = 25
            minSize = 16
        }else if(str == 3){
            maxSize = 35
            minSize = 26
        }else if(str == 4){
            minSize = 36
            maxSize = 1000
        }

        const filteredHouse = housings.filter(item => {

            if (type !== '' && item.type !== type){
                return false
            }

            if(utleier !== '' && item.provider !== utleier){
                return false
            }

            if(bad !== '' && item.housingConditions.privateBathroom !== (bad === "true")) {
                return false
            }

            if(kjokken !== '' && item.housingConditions.privateKitchen !== (kjokken === "true")){
                return false
            }

            if(pris !== '' && (priceMin > item.pricePerMonth || priceMax < item.pricePerMonth)){
                return false
            }

            if(str !== '' && (minSize > item.housingConditions.sizeSqm || maxSize < item.housingConditions.sizeSqm)){
                return false
            }

            return true;
        })

        filteredHouse.forEach(item => {

            const newCardData = {
                link: 'specifics.html'+'?param1='+item.id,
                image: item.media.images[0],
                tags: getTags(item),
                type: item.type,
                pris: item.pricePerMonth,
                place: `${item.address.city}, ${item.address.street}`,
                badogkjokken: getWetRoomType(item),
                kvm: item.housingConditions.sizeSqm,
                avstand: Math.round(item.housingConditions.distanceToCityCentre),
                starslist: getStars(item)
            };
            
            createCard(newCardData);
        })
    });
}