function render(){
	b.transform(tm)
	sc.rotate(10,10,10)
}
var sc=new Scene()
var c=new PerspectiveCamera(300)
var b=new Box(0,0,0,100,100,100,{lineCap:"round",lineWeight:5,lineColor:color(128,0,0),sideColor:[color(255,0,0,.5),color(255,0,0,.5),color(255,0,0,.5),color(255,0,0,.5),color(255,0,0,.5),color(255,0,0,.5)]})
var tm=new TransformMatrix(["rotZ",0.5])
sc.camera(c)
sc.appendElement(b)
sc.render=render
sc.start()