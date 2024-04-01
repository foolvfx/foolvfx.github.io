function getChampImg(champname) {
    const img = document.createElement('img')
    img.src = `./champion/${champname}.png`
    img.alt = champname
    return img
}

function createHeaderRow(headers) {
    const head_row = document.createElement('div')
    head_row.className = 'table-row heading'

    for (const htxt of headers) {
        const head = document.createElement('div')
        head.className = 'row-item'
        head.textContent = htxt
        head_row.appendChild(head)
    }

    return head_row
}

function createChampItems(champs) {
    const champ_item = document.createElement('div')
    const ban_item = document.createElement('div')
    champ_item.className = 'row-item'
    ban_item.className = 'row-item'

    champs['champs'].slice(0,3).forEach(ele => {
        const champ_img = getChampImg(ele[0])
        champ_img.className = 'champ-icon'
        champ_item.appendChild(champ_img)
    })
    
    champs['ban'].slice(0,3).forEach(ele => {
        const champ_img = getChampImg(ele[0])
        champ_img.className = 'champ-icon'
        ban_item.appendChild(champ_img)
    })

    const c_len = champ_item.children.length
    const b_len = ban_item.children.length
    
    for (let i = 0; i < 3-c_len; i++) {
        const champ_img = getChampImg('placeholder')
        champ_img.className = 'champ-icon'
        champ_item.appendChild(champ_img)
    }

    for (let i = 0; i < 3-b_len; i++) {
        const champ_img = getChampImg('placeholder')
        champ_img.className = 'champ-icon'
        ban_item.appendChild(champ_img)
    }

    return { 'champ_item': champ_item, 'ban_item': ban_item }
}

async function createLeaderboard(tbl_container) {
    tbl_container.innerHTML = ''

    const season = 1
    // const season = document.getElementById("season")
    const data = await (await fetch('./data/data.json')).json()
    const matchdata = await (await fetch('./data/matchdata.json')).json()
    const headers = await (await fetch('./data/headers.json')).json()
    
    const matches = matchdata[season]
    const users = data['users'][season]

    const stats = await createStats(matches, users)

    const head_row = createHeaderRow(headers['stats'])
    tbl_container.appendChild(head_row)

    var placement_num = 0

    for (const user in stats) {
        placement_num++

        let placement_block = ''

        if (placement_num <= 4) {
            placement_block = 'top-4'
        } else if (placement_num <= 8) {
            placement_block = 'top-8'
        } else {
            placement_block = 'not-qualified'
        }

        const urow = document.createElement('div')
        urow.className = `table-row ${placement_block}`
        urow.id = `s${season}p${placement_num}`

        const avg_dur = getAvgDuration(stats[user])
        const champs = getChampData(stats[user])

        const placement = document.createElement('div')
        placement.className = 'row-item'
        placement.textContent = placement_num
        const player = document.createElement('div')
        player.className = 'row-item player'
        player.textContent = user
        const win_loss = document.createElement('div')
        win_loss.className = 'row-item'
        win_loss.textContent = `${stats[user]['wins']} - ${stats[user]['losses']}`
        const win_rate = document.createElement('div')
        win_rate.className = 'row-item'
        win_rate.textContent = `${stats[user]['winrate']}%`
        // win_rate.style = `color:${getColor(stats[user]['winrate']/100)};font-weight:bold;`
        const num_matches = document.createElement('div')
        num_matches.className = 'row-item'
        num_matches.textContent = stats[user]['matches']
        const avg_length = document.createElement('div')
        avg_length.className = 'row-item'
        avg_length.textContent = avg_dur
        const unique_champs = document.createElement('div')
        unique_champs.className = 'row-item'
        unique_champs.textContent = Object.keys(champs['champs']).length

        const { champ_item, ban_item } = createChampItems(champs)
        
        urow.appendChild(placement)
        urow.appendChild(player)
        urow.appendChild(win_loss)
        urow.appendChild(win_rate)
        urow.appendChild(num_matches)
        urow.appendChild(avg_length)
        urow.appendChild(unique_champs)
        urow.appendChild(champ_item)
        urow.appendChild(ban_item)

        tbl_container.appendChild(urow)
    }
}

function getColor(value){
    var hue=((value)*120).toString(10);
    return ["hsl(",hue,",100%,75%)"].join("");
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