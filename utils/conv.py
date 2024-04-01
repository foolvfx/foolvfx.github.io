from utils import write_json, load_json
import pandas as pd

jsdata = load_json('data.json')

df = pd.read_csv('wc1.csv')

mat = df.T.to_dict()

for m in mat.values():
    if m['player_1'] in jsdata['users'] and m['player_2'] in jsdata['users']:
        newmat = { 
                  'szn': 0, '#': m['#'], 'stage': m['stage'], 'winner': m['winner'],
                  'p1': {
                      'name': m['player_1'],
                      'champ': m['p1_champ'],
                      'ban': m['p1_ban']
                  },
                  'p2': {
                      'name': m['player_2'],
                      'champ': m['p2_champ'],
                      'ban': m['p2_ban']
                  },
                  'win_method': m['win_method'],
                  'duration': f"{int(m['length (s)']/60)}:{int(m['length (s)']%60)}"
                  }
        jsdata['matches'].append(newmat)

write_json('newdata.json', jsdata)