import os

for f in os.listdir('./champion'):
    newpath = f'./champion/{f.lower()}'
    os.rename(f'./champion/{f}', newpath)