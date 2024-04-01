async function createMatchHistory(tbl_container) {
    tbl_container.innerHTML = ''

    const season = 1
    // const season = document.getElementById("season")
    const data = await (await fetch('./data/data.json')).json()
    const matchdata = await (await fetch('./data/matchdata.json')).json()
    const headers = await (await fetch('./data/headers.json')).json()
    
    const matches = matchdata[season]
    const users = data['users'][season]

    const head_row = createHeaderRow(headers['match_history'])
    tbl_container.appendChild(head_row)

    for (const mat of matches) {
        const match_row = document.createElement("div")
        match_row.className = `table-row ${mat['stage']}`

        const winner = mat['winner'] == 'p1' ? mat['p1'] : mat ['p2']
        const loser = mat['winner'] != 'p1' ? mat['p1'] : mat ['p2']

        const stage = document.createElement('div')
        stage.className = 'row-item'
        stage.textContent = `${mat['stage']} - #${mat['#']}`
        const winner_frame = createPlayerFrame(winner)
        const loser_frame = createPlayerFrame(loser)
        const win_method = document.createElement('div')
        win_method.className = 'row-item'
        win_method.textContent = `${mat['win_method']} @ ${mat['duration']}`
        const ban_frame = createBanFrame(winner, loser)

        match_row.appendChild(stage)
        match_row.appendChild(winner_frame)
        match_row.appendChild(loser_frame)
        match_row.appendChild(win_method)
        match_row.appendChild(ban_frame)

        tbl_container.appendChild(match_row)
    }
}

function createPlayerFrame(player) {
    const pframe = document.createElement('div')
    pframe.className = 'row-item'
    pframe.style = 'justify-content: left;'

    const champ_image = getChampImg(player['champ'])
    champ_image.className = 'champ-icon'

    const player_name = document.createElement('span')
    player_name.className = 'player-name'
    player_name.textContent = player['name']

    pframe.appendChild(champ_image)
    pframe.appendChild(player_name)

    return pframe
}

function createBanFrame(winner, loser) {
    const bframe = document.createElement('div')
    bframe.className = 'row-item ban-frame'

    const winner_ban = getChampImg(winner['ban'])
    winner_ban.className = 'champ-icon'

    const loser_ban = getChampImg(loser['ban'])
    loser_ban.className = 'champ-icon'

    bframe.appendChild(winner_ban)
    bframe.appendChild(loser_ban)

    return bframe
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

function getChampImg(champname) {
    const img = document.createElement('img')
    img.src = `./champion/${champname}.png`
    img.alt = champname
    return img
}