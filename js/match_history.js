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