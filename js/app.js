(function(){

  // our alternating sequence
  const bn = (n)=>{
    return sign(n+1)*1/n;
  };

  const sign = (n)=>{
    if (n%2 == 0){
      return 1;
    } else {
      return -1;
    }
  };



  let estSum = 0;
  let minSum = Infinity;
  let maxSum = -Infinity;

  // poor man's infinite series
  for (let i = 1; i < 99999; i++){
    estSum += bn(i);
    if (estSum < minSum){ minSum = estSum; }
    if (estSum > maxSum){ maxSum = estSum; }
  }

  
  // svg dimensions
  const dim = { x: 800, y: 600 };

  
  // maps x from minSum to maxSum to 0 to dim.x
  // map y from 0 to 1 to 0 to dim.y
  function valueMapping(x,y) {
     const newX = dim.x*(x - minSum+0.05)/(maxSum-minSum+0.1);
     return {
       x: newX, 
       y: (1-y)*dim.y
     }
  }


  function drawNumberLine(surface){
    const yPos = 0.05;
    const p1 = valueMapping(minSum-0.5, yPos);
    const p2 = valueMapping(maxSum+0.5, yPos);

    const strokeParams = {
      width: '1px', color: 'lightgrey'
    };

    surface.line(p1.x, p1.y, p2.x, p2.y)
      .stroke(strokeParams);

    let roundedMax = Math.ceil(maxSum*10)/10;
    for (let i = Math.floor(minSum*10)/10; i < maxSum; i += 0.1){
      const p1Top = valueMapping(i, yPos+0.01);
      const p1Bottom = valueMapping(i, yPos-0.01);
      const pText = valueMapping(i, yPos-0.02);

      surface.line(p1Top.x, p1Top.y, p1Bottom.x, p1Bottom.y)
        .stroke(strokeParams);

      surface.text(String(Math.round(i*10)/10))
        .move(pText.x, pText.y)
        .fill({
          color: 'lightgrey',
        })
        .font({
          family: 'Arial',
          anchor: 'middle'
        });
    }
  }


  function drawMainSumLine(surface){
    let point = valueMapping(estSum, 0);

    let p2 = valueMapping(estSum, 0.11);
    let est = Math.round(estSum*1e5)/1e5;

    surface.foreignObject(100,100)
      .add(SVG('<p>$$S\\approx'+est+'$$</p>'))
      .move(p2.x,p2.y);

    return new Promise((resolve)=>{
      surface.line(point.x,0, point.x, dim.y)
      .stroke({
        width: '2px',
        color: '#1212aa',
        opacity: 0
      })
      .animate({
        duration: 500
      })
      .stroke({
        opacity: 0.4
      })
      .after(resolve);
    });
  }

  function drawSumApprox(n, sigma, y, surface){
    let point = valueMapping(sigma, y );
    let textPoint = valueMapping(sigma-0.01, y+0.07);

    let est = Math.round(sigma*1e5)/1e5;

    surface.foreignObject(100,100)
      .add(SVG('<p>$$S_'+n+'\\approx'+est+'$$</p>'))
      .move(textPoint.x,textPoint.y);
    MathJax.typeset();

    return new Promise((resolve)=>{
      surface.line(point.x,0, point.x, dim.y)
      .stroke({
        width: '2px',
        color: '#12aa12',
        opacity: 0
      })
      .animate({
        duration: 2000
      })
      .stroke({
        opacity: 0.4
      })
      .after(resolve);
    });
    
  }

  function drawSeriesElement(n, bn,bn1,y, surface){
    let p1 = valueMapping(bn, y);
    let p2 = valueMapping(bn1, y);
    let mp = valueMapping((bn+bn1)/2, y+0.06);

    surface.foreignObject(100,100)
      .add(SVG('<p>$$a_'+n+'$$</p>'))
      .move(mp.x,mp.y);
    MathJax.typeset();

    return new Promise((resolve)=>{
      surface.line( p1.x, p1.y, p2.x, p2.y )
      .stroke({
        width: '2px',
        color: '#12aabb',
        opacity: 0
      })
      .animate({
        duration: 2000
      })
      .stroke({
        opacity: 0.4
      })
      .after(resolve);
    });
  }

  function drawError(n, S, Sn, y, surface){
    let p1 = valueMapping(S, y);
    let p2 = valueMapping(Sn, y);
    let mp = valueMapping((S+Sn-0.1)/2, y+0.06);

    surface.foreignObject(100,100)
      .add(SVG('<p>$$|S-S_'+n+'|\\lt{a_'+(n+1)+'}$$</p>'))
      .move(mp.x,mp.y);
    MathJax.typeset();

    return new Promise((resolve)=>{
      surface.line( p1.x, p1.y, p2.x, p2.y )
      .stroke({
        width: '2px',
        color: '#ee2299',
        opacity: 0
      })
      .animate({
        duration: 2000
      })
      .stroke({
        opacity: 0.4
      })
      .after(resolve);
    });
  }


  function loop(n,sum,y,draw){
    var newSum;

    drawSumApprox(n,sum, y, draw)
    .then(()=>{
      n += 1;
      y += 0.1;
      newSum = sum + bn(n);
      return drawSeriesElement(n, sum, newSum, y, draw);
    })
    .then(()=>{
      return drawError(n-1, estSum, sum, y-0.05, draw);
    })
    .then(()=>{
      if (n <= 10){
        loop(n, newSum, y, draw);
      }
    });

  }
  

  SVG.on(document, 'DOMContentLoaded', function() {
    var draw = SVG().addTo('article').size(dim.x, dim.y);
    var timeline = new SVG.Timeline();
    //draw.foreignObject(100,100).add(SVG('<p>$$\\frac{1}{2}$$</p>')).move(20,20);

    /*
    var n = 1;
    var sum = bn(n);
    var y = 0.05;
    var newSum;
    */

    drawNumberLine(draw);
    drawMainSumLine(draw)
    .then(()=>{
      loop(1, bn(1), 0.05, draw);
    });
    /*
    .then(()=>{
      return drawSumApprox(n, sum, draw);
    })
    .then(()=>{
      n += 1;
      y += 0.1;
      newSum = sum + bn(n);
      return drawSeriesElement(n, sum, newSum, y, draw);
    })
    .then(()=>{
      return drawError(n-1, estSum, sum, y-0.05, draw);
    });*/

  });
})();

