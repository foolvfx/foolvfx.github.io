async function createMatchHistory(container) {
    container.innerHTML = ''
    const season = document.getElementById("season")
    const data = await (await fetch('./data/data.json')).json()
    const matchdata = await (await fetch('./data/matchdata.json')).json()
    const headers = await (await fetch('./data/headers.json')).json()
    
    const matches = matchdata[season.value]
    const users = data['users'][season.value]

    for (const mat of matches) {
        const row = document.createElement("div")
        row.className = 'match_row'
        
        let row_obj = {
            "szn": mat["szn"],
            "#": mat["#"],
            "stage": mat["stage"],
            "winner": null,
            "loser": null,
            "won_by": mat["win_method"],
            "duration": mat["duration"],
        }

        let p1_frame = playerFrame(mat['p1'])
        let p2_frame = playerFrame(mat['p2'])

        if (mat['winner'] == 'p1') {
            row_obj['winner'] = p1_frame
            row_obj['loser'] = p2_frame
        } else {
            row_obj['loser'] = p1_frame
            row_obj['winner'] = p2_frame
        }

        row_obj['winner'].id = 'winner'
        row_obj['loser'].id = 'loser'

        const match_num = document.createElement("div")
        match_num.className = 'match_num'
        match_num.textContent = row_obj['#']

        const event_frame = document.createElement("div")
        event_frame.className = 'event'
        event_frame.innerHTML = `<a>S${row_obj['szn']}</a>\n<a>${row_obj['stage']}</a>`

        const won_by = document.createElement("div")
        won_by.className = 'won_by'
        won_by.textContent = `${row_obj['won_by']} @ ${row_obj['duration']}`

        row.appendChild(match_num)
        row.appendChild(event_frame)
        row.appendChild(row_obj['winner'])
        row.appendChild(row_obj['loser'])
        row.appendChild(won_by)

        container.appendChild(row)
    }
}

function playerFrame(player) {
    const pl = document.createElement("div")
    pl.className = 'player_frame'

    const champ_icon = getChampImg(player['champ'])
    champ_icon.className = 'champ_icon'
    
    const pl_name = document.createElement("span")
    pl_name.textContent = player['name']
    
    const ban_icon = getChampImg(player['ban'])
    ban_icon.className = 'ban_icon'
    
    pl.appendChild(champ_icon)
    pl.appendChild(pl_name)
    pl.appendChild(ban_icon)

    return pl
}

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
        <td>${stats[user]['winrate']}%</td>
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