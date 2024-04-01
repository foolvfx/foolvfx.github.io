async function createMatrix(matrix_container) {
    const data = await (await fetch('./data/data.json')).json()
    const matchdata = await (await fetch('./data/matchdata.json')).json()

    const users = data['users']['1']
    users.unshift(null)

    for (let i = 0; i < users.length; i++) {
        const matrix_row = document.createElement('div')
        matrix_row.className = 'matrix-row'

        for (let k = 0; k < users.length; k++) {
            const matrix_item = document.createElement('div')
            matrix_item.className = `matrix-item row-${i} col-${k}`

            const matrix_txt = document.createElement('span')
            matrix_txt.className = 'matrix-txt'
            
            if (users[i] == null) {
                matrix_txt.textContent = users[k]
            } else if (users[k] == null) {
                matrix_txt.textContent = users[i]
            }

            matrix_item.appendChild(matrix_txt)
            
            if (i == k) {
                matrix_item.style = "background-color: #08090A;"
            }

            matrix_row.appendChild(matrix_item)
        }

        matrix_container.appendChild(matrix_row)
    }

    const u_map = getUserMap(users)
    
    for (let mat of matchdata['1']) {
        const p1_coord = u_map[mat['p1']['name']]
        const p2_coord = u_map[mat['p2']['name']]

        matrix_container.children[p1_coord].children[p2_coord].style = mat['winner'] != 'p1' ? "background-color: #DB324D;" : "background-color: #9fff9f;"
        matrix_container.children[p1_coord].children[p2_coord].children[0].textContent = `${mat['win_method']} @ ${mat['duration']}`

        matrix_container.children[p2_coord].children[p1_coord].style = mat['winner'] == 'p1' ? "background-color: #DB324D;" : "background-color: #9fff9f;"
        matrix_container.children[p2_coord].children[p1_coord].children[0].textContent = `${mat['win_method']} @ ${mat['duration']}`
    }
}

function getUserMap(users) {
    const u_map = users.map((usr_name, index) => {
        return [usr_name, index]
    })
    
    const u_map_dict = {}
    
    u_map.forEach(ele => {
        u_map_dict[ele[0]] = ele[1]
    })

    return u_map_dict
}