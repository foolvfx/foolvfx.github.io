function getChampImg(champname) {
    const img = document.createElement('img')
    img.src = `./champion/${champname}.png`
    img.alt = champname
    return img
}

async function createLeaderboard(table) {
    table.innerHTML = ''
    const season = document.getElementById("season")
    const data = await (await fetch('./data/data.json')).json()
    const matchdata = await (await fetch('./data/matchdata.json')).json()
    const headers = await (await fetch('./data/headers.json')).json()
    
    const matches = matchdata[season.value]
    const users = data['users'][season.value]

    const stats = await createStats(matches, users)

    const tbl_head = document.createElement('tr')
    tbl_head.className = 'stats_header'

    for (const htxt of headers['stats']) {
        const head = document.createElement('th')
        head.textContent = htxt
        if (htxt == '#') {
            head.id = 'placement'
        } else {
            head.id = htxt
        }

        tbl_head.appendChild(head)
    }

    table.appendChild(tbl_head)

    var placement = 0

    for (const user in stats) {
        const urow = document.createElement('tr')
        urow.className = 'user_row'

        placement++

        if (season.value == 1 && placement == 8) {
            urow.style = "border-bottom: 2px solid red;"
        }
        

        let avg_dur = getAvgDuration(stats[user])
        

        const champs = getChampData(stats[user])

        urow.innerHTML = `
        <td>${placement}</td>
        <td>${user}</td>
        <td>${stats[user]['wins']} - ${stats[user]['losses']}</td>
        <td style="background-color:${getColor(stats[user]['winrate']/100)};font-weight:bold;">${stats[user]['winrate']}%</td>
        <td>${stats[user]['matches']}</td>
        <td>${avg_dur}</td>
        <td>${Object.keys(champs['champs']).length}</td>
        `

        const top_champs = document.createElement('td')
        const top_banned = document.createElement('td')

        champs['champs'].slice(0,3).forEach(ele => {
            const champ_container = document.createElement('div')
            champ_container.className = 'champ_container'

            const champ_img = getChampImg(ele[0])
            champ_img.className = 'stats_cicon'

            const quant = document.createElement('div')
            quant.className = 'champ_quant'
            quant.textContent = ele[1]

            champ_container.appendChild(champ_img)

            champ_container.appendChild(champ_img)
            champ_container.appendChild(quant)
            top_champs.appendChild(champ_container)
        })
        
        champs['ban'].slice(0,3).forEach(ele => {
            const champ_container = document.createElement('div')
            champ_container.className = 'champ_container'
    
            const champ_img = getChampImg(ele[0])
            champ_img.className = 'stats_cicon'
    
            const quant = document.createElement('div')
            quant.className = 'champ_quant'
            quant.textContent = ele[1]
    
            champ_container.appendChild(champ_img)
    
            champ_container.appendChild(champ_img)
            champ_container.appendChild(quant)
            top_banned.appendChild(champ_container)
        })

        urow.appendChild(top_champs)
        urow.appendChild(top_banned)

        table.appendChild(urow)
    }
}

function getAvgDuration(user) {
    if (user['total_duration'] <= 0) {
        return '0:00'
    }

    let avg_dur = Math.round(user['total_duration']/user['matches'])
    let min = Math.floor(avg_dur/60)
    let sec = avg_dur%60 < 9 ? `0${avg_dur%60}` : `${avg_dur%60}`

    return `${min}:${sec}`
}

function getChampData(user) {
    const champs = {}
    const banned = {}

    user['champions'].forEach(ele => {
        if (champs[ele]) {
            champs[ele] += 1
        } else {
            champs[ele] = 1
        }
    })

    user['banned_against'].forEach(ele => {
        if (banned[ele]) {
            banned[ele] += 1
        } else {
            banned[ele] = 1
        }
    })

    var most_champs = Object.keys(champs).map(function(key) {
        return [key, champs[key]]
    })
    var most_ban = Object.keys(banned).map(function(key) {
        return [key, banned[key]]
    })

    most_champs.sort(function(first, second) {
        return second[1] - first[1]
    })

    most_ban.sort(function(first, second) {
        return second[1] - first[1]
    })

    return { 'champs': most_champs, 'ban': most_ban }
}

async function createStats(matches, users) {
    let stats = {}

    for (let user of users) {
        stats[user] = { 'wins': 0, 'losses': 0, 'matches': 0, 'total_duration': 0,
        'champions': [], 'bans': [], 'banned_against': [] }
    }

    for (let mat of matches) {
        const winner = mat['winner'] == 'p1' ? mat['p1'] : mat['p2']
        const loser = mat['winner'] == 'p2' ? mat['p1'] : mat['p2']

        stats[winner['name']]['wins']++
        stats[winner['name']]['matches']++
        stats[winner['name']]['champions'].push(winner['champ'])
        stats[winner['name']]['bans'].push(winner['ban'])
        stats[winner['name']]['banned_against'].push(loser['ban'])
        stats[winner['name']]['total_duration'] += (Number(mat['duration'].split(':')[0])*60) + (Number(mat['duration'].split(':')[1]))

        stats[loser['name']]['losses']++
        stats[loser['name']]['matches']++
        stats[loser['name']]['champions'].push(loser['champ'])
        stats[loser['name']]['bans'].push(loser['ban'])
        stats[loser['name']]['banned_against'].push(winner['ban'])
        stats[loser['name']]['total_duration'] += (Number(mat['duration'].split(':')[0])*60) + (Number(mat['duration'].split(':')[1]))
    }

    for (const user in stats) {
        stats[user]['winrate'] = Math.round((stats[user]['wins'] / stats[user]['matches'])*100)
        if (isNaN(stats[user]['winrate'])) {
            stats[user]['winrate'] = 0
        }
    }

    var sort_stats = Object.keys(stats).map(function(key) {
        return [key, stats[key]['winrate'], stats[key]['matches']]
    })

    sort_stats.sort(function(first, second) {
        return second[2] - first[2]
    })

    sort_stats.sort(function(first, second) {
        return second[1] - first[1]
    })

    const sorted = {}

    sort_stats.forEach(ele => {
        sorted[ele[0]] = stats[ele[0]]
    })

    return sorted
}

function getColor(value){
    //value from 0 to 1
    var hue=((value)*120).toString(10);
    return ["hsl(",hue,",100%,50%)"].join("");
}