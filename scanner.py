"""Two views of the same mathematical object with a draggable reveal."""
def scanner(course):
    if course:
        title='What does a shear do to a grid?'
        grid=''.join(f'<path d="M{x} 0v100 M0 {x}h240"/>' for x in range(-100,261,20))
        def scene(matrix,colour):
            return f'<g transform="{matrix}" stroke="{colour}" fill="none">{grid}<rect x="75" y="25" width="50" height="50" fill="{colour}" fill-opacity=".4"/></g>'
        before=scene('translate(0)','#73ddd4')
        after=scene('matrix(1 0 .5 1 0 0)','#bda7ff')
        caption='Reveal the shear (x, y) → (x + ½y, y) in screen coordinates.'
    else:
        title='Where is the graph in a transit map?'
        nodes=[(18,69),(63,69),(114,36),(173,36),(222,62)]
        graph='<path d="M18 69H63L114 36H173L222 62" stroke="#8de6dc" stroke-width="3" fill="none"/>'
        graph+=''.join(f'<circle cx="{x}" cy="{y}" r="4" fill="#fff"/><text x="{x}" y="{y+14}" text-anchor="middle" fill="white" font-size="9">{letter}</text>' for (x,y),letter in zip(nodes,'ABCDE'))
        before='<path d="M-10 87Q70 44 122 77T250 82" stroke="#416d99" stroke-width="8" fill="none"/>'+''.join(f'<rect x="{x}" y="{y}" width="14" height="17" fill="#465b84"/>' for x,y in [(10,15),(35,40),(70,15),(140,72),(190,7)])+graph
        after=graph
        caption='Reveal the stations as vertices and the direct links as edges.'
    return f'<figure class="scanner"><h3>{title}</h3><svg viewBox="0 0 240 100" role="img" aria-label="{title}"><defs><clipPath id="wipe"><rect width="120" height="100"/></clipPath></defs>{before}<g clip-path="url(#wipe)"><rect width="240" height="100" fill="#23234d"/>{after}</g><path class="seam" d="M120 0v100" stroke="#ffd493"/></svg><label>{caption}<input aria-label="Reveal transformed view" type="range" min="0" max="240" value="120"></label></figure><script defer src="scanner.js?v=motion2"></script>'
