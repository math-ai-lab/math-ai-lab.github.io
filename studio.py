"""Illustrated scenes for the lab pages."""
from math import sin, cos, pi

def surface():
    curves=[]
    for swap in (False,True):
        for i in range(-10,11):
            points=[]
            for j in range(-30,31):
                u,v=i/10,j/30
                if swap: u,v=v,u
                x=210+86*(u-v)
                y=104+36*(u+v)-53*(u*u-v*v)
                points.append(f'{x:.1f},{y:.1f}')
            curves.append('<polyline points="'+' '.join(points)+'"/>')
    return '<svg class="surface" viewBox="0 0 420 210" role="img" aria-label="Wireframe of the saddle surface z equals x squared minus y squared"><g fill="none" stroke="currentColor" stroke-width="1.15">' + ''.join(curves)+'</g></svg>'

def lab_demo():
    return """<div class="sample"><div class="sample-top">Discrete mathematics <span>Worked example</span></div><h3>Decode the network</h3><p>How many edges does a cycle on five vertices have?</p><svg viewBox="0 0 240 125" aria-label="Five vertices connected in a cycle" role="img"><path d="M120 13 176 51 154 108 86 108 64 51Z" fill="#2167e822" stroke="#70e3de" stroke-width="3"/>""" + ''.join(f'<circle cx="{x}" cy="{y}" r="6" fill="#b9c9ff"/>' for x,y in [(120,13),(176,51),(154,108),(86,108),(64,51)])+"""</svg><div class="answers" aria-label="Choose an edge count"><button type="button">4</button><button type="button">5</button><button type="button">10</button></div><output aria-live="polite">Choose an answer to check your reasoning.</output></div>"""

def learning():
    return """<div class="rotation"><label>Rotate a unit vector <input type="range" min="0" max="360" step="15" value="45"></label><svg viewBox="-110 -95 220 190" role="img" aria-label="Unit circle and rotated vector"><circle r="67" fill="none" stroke="#a7b9db"/><path d="M-95 0H95M0 -90V90" stroke="#a7b9db"/><g class="vector" transform="rotate(-45)"><path d="M0 0H67m-8 -4 8 4-8 4" fill="none" stroke="#2167e8" stroke-width="3"/></g></svg><output>45° · (0.71, 0.71)</output></div>"""

def enrich(file,body):
    example=lab_demo()
    body=body.replace('<div class="poster" aria-hidden="true">ThinkXP</div>',example)
    if file=='thinkxp.html': body=body.replace('<section class="row"',example+'<section class="row"',1)
    if file in ('research.html','about.html'):body=body.replace('<section class="row"',surface()+'<section class="row"',1)
    if file=='index.html':body=body.replace('<h2>Research &amp; exploration</h2>','<div><h2>Research &amp; exploration</h2>'+surface()+'</div>')
    if file=='learning.html':body=body.replace('<section class="row"',learning()+'<section class="row"',1)
    return body
