function color(r,g,b,a){
	function hex(n){
		if (typeof n==="string"||n instanceof String){if (n.length==2){return n};return "0"+n}
		if (-1<n<256){if (n.toString(16).length==2){return n.toString(16)};return "0"+n.toString(16)}
		return "00" 
	}
	if (r!=undefined&&g==undefined&&b==undefined&&a==undefined&&typeof r=="string"){
		return r
	}
	else if (r!=undefined&&g!=undefined&&b==undefined&&a==undefined&&typeof r=="string"){
		return color(...rgb(r),g)
	}
	else if (r!=undefined&&g!=undefined&&b==undefined&&a==undefined){
		a=g
		g=r
		b=r
	}
	else if (r!=undefined&&g==undefined&&b==undefined&&a==undefined){
		g=r
		b=r
	}
	if(a!=undefined){return `rgba(${r}, ${g}, ${b}, ${a})`}
	return "#"+hex(r)+hex(g)+hex(b)
}
class Vector{
	constructor(x,y,z){
		this.x=x||0
		this.y=y||0
		this.z=z||0
	}
	set(x,y,z){
		this.x=x||0
		this.y=y||0
		this.z=z||0
		return this
	}
	add(x,y,z){
		this.x=+x||0
		this.y=+y||0
		this.z=+z||0
		return this
	}
	sub(x,y,z){
		this.x=-x||0
		this.y=-y||0
		this.z=-z||0
		return this
	}
	mult(a){
		this.x*=a
		this.y*=a
		this.z*=a
		return this
	}
	div(a){
		a=this._val(a)
		this.x/=a
		this.y/=a
		this.z/=a
		return this
	}
	transform(m){
		function toMatrix(ths){
			var a=[]
			a.push([ths.x])
			a.push([ths.y])
			a.push([ths.z])
			a.push(1)
			return new _Mat(a)
		}
		var a=toMatrix(this)
		a.mult(m)
		this.set(...a.toArray())
		return this
	}
	copy(){
		return new Vector(this.x,this.y,this.z)
	}
	cross(v){
		var x=this.y*v.z-this.z*v.y
		var y=this.z*v.x-this.x*v.z
		var z=this.x*v.y-this.y*v.x
		return new Vector(x,y,z)
	}
	normalize(){
		var m=Math.sqrt(this.x**2+this.y**2+this.z**2)
		if (m!=0){this.mult(1/m)}
		return this
	}
}
class _Mat{
	constructor(dt){
		this.data=[]
		for (var y=0;y<dt.length;y++){
			this.data.push([])
			for (var x=0;x<dt[0].length;x++){
				this.data[y].push(0)
			}
		}
		for (var y=0;y<dt.length;y++){
			if (!Array.isArray(dt[y])){dt[y]=[dt[y]]}
		}
		for (var y=0;y<this.data.length;y++){
			for (var x=0;x<this.data[0].length;x++){
				this.data[y][x]=dt[y][x]
			}
		}
	}
	mult(dt){
		dt=dt.data
		if (dt[0].length!=this.data.length){console.warn("Rows A doesn't match columns B");return this}
		var na=new _Mat(this.data)
		for (var Ax=0;Ax<this.data[0].length;Ax++){
			for (var By=0;By<dt.length;By++){
				var pr=0
				for (var x=0;x<dt.length;x++){
					pr+=dt[By][x]*this.data[x][Ax]
				}
				na.data[By][Ax]=pr
			}
		}
		this.data=na.data
		return this
	}
	toArray(){
		var a=[]
		for (var k of this.data.slice().splice(0,this.data.length-1)){
			a.push(k[0])
		}
		return a
	}
}
class Scene{
	_gC(){
		var c=document.createElement("canvas")
		c.width=1000
		c.height=667
		c.id="C-3D-1"
		c.style.margin="0px"
		c.style.border="solid 5px blue"
		if (document.readyState!=="complete"&&document.readyState!=="interactive"){
			document.addEventListener("DOMContentLoaded",function(){f(c)})
			function f(c){
				document.body.appendChild(c)
				document.body.style.margin="0px"
				document.body.style.border="none"
				for (var c of document.body.childNodes){
					if (c.id!="C-3D-1"&&c.tagName=="CANVAS"){
						document.body.removeChild(c)
						break
					}
				}
			}
		}
		else{
			document.body.appendChild(c)
			document.body.style.margin="0px"
			document.body.style.border="none"
			for (var c of document.body.childNodes){
				if (c.id!="C-3D-1"&&c.tagName=="CANVAS"){
					document.body.removeChild(c)
					break
				}
			}
		}
		return c
	}
	constructor(c){
		this._o=[]
		this._w=c||this._gC()
		this._wC=this._w.getContext("2d")
		this._c=new PerspectiveCamera()
		this.EXIT=false
		this._fr=10
		this._c._st(this)
	}
	appendElement(el){
		if (el._3D!=true){return console.error(`Element '${el.constructor.name}' isn't 3D compatible!`)}
		this._o.push(el)
		el._rc(this)
	}
	render(){}
	_rd(){
		this.render()
		if (document.readyState==="complete"||document.readyState==="interactive"){
			this._wC.clearRect(0,0,this._w.width,this._w.height)
			for (var k of this._o){
				k._rd()
				k.restore()
			}
		}
		this._c._tk.clear()
		var ths=this
		setTimeout(function(){ths._rd()},this._fr)
	}
	start(){
		this._rd()
	}
	camera(c){
		this._c=c
		this._c._st(this)
	}
	translate(x,y,z){
		var t=new TransformMatrix(["translate",x,y,z])
		this._c._appt(t)
	}
	rotate(a,b,c,x,y,z){
		var t=new TransformMatrix(["rotX",a,x,y,z],["rotY",b,x,y,z],["rotZ",c,x,y,z])
		this._c._appt(t)
	}
}
class Box{
	constructor(x,y,z,w,h,d,_cnf){
		this.x=x
		this.y=y
		this.z=z
		this.w=w
		this.h=h
		this.d=d
		this._l=[]
		this._l.push(new Vector(this.x-this.w,this.y-this.h,this.z-this.d))
		this._l.push(new Vector(this.x-this.w,this.y-this.h,this.z+this.d))
		this._l.push(new Vector(this.x+this.w,this.y-this.h,this.z+this.d))
		this._l.push(new Vector(this.x+this.w,this.y-this.h,this.z-this.d))
		this._l.push(new Vector(this.x-this.w,this.y+this.h,this.z-this.d))
		this._l.push(new Vector(this.x-this.w,this.y+this.h,this.z+this.d))
		this._l.push(new Vector(this.x+this.w,this.y+this.h,this.z+this.d))
		this._l.push(new Vector(this.x+this.w,this.y+this.h,this.z-this.d))
		this._s=[]
		this._s.push([this._l[0],this._l[1],this._l[2],this._l[3]])
		this._s.push([this._l[3],this._l[2],this._l[6],this._l[7]])
		this._s.push([this._l[4],this._l[5],this._l[6],this._l[7]])
		this._s.push([this._l[4],this._l[5],this._l[1],this._l[0]])
		this._s.push([this._l[4],this._l[0],this._l[3],this._l[7]])
		this._s.push([this._l[1],this._l[5],this._l[6],this._l[2]])
		this._cnf={_lS:"butt",_lW:1,_lC:color(0),_sC:[color(255),color(255),color(255),color(255),color(255),color(255)]}
		this._3D=true
		this._sc=null
		this._st=[]
		if (_cnf!=undefined){
			this.data(_cnf)
		}
	}
	_rc(sc){
		this._sc=sc
	}
	_rd(){
		var c=this._sc._wC,cam=this._sc._c
		function sides(ths){
			var a=[]
			for (var i=0;i<4;i++){
				a.push([cam.calc(ths._l[i]),cam.calc(ths._l[(i+1)%4])])
				a.push([cam.calc(ths._l[i+4]),cam.calc(ths._l[(i+1)%4+4])])
				a.push([cam.calc(ths._l[i]),cam.calc(ths._l[(i+4)])])
			}
			return a
		}
		c.save()
		c.lineCap=this._cnf._lS
		c.lineWidth=this._cnf._lW
		if (this._cnf._lC!=null){
			c.strokeStyle=this._cnf._lC
			for (var s of sides(this)){
				c.beginPath()
				c.moveTo(s[0].x,s[0].y)
				c.lineTo(s[1].x,s[1].y)
				c.stroke()
			}
		}
		for (var i=0;i<this._s.length;i++){
			if (this._cnf._sC[i]!=null){
				c.fillStyle=this._cnf._sC[i]
				var f=this._s[i]
				c.beginPath()
				c.moveTo(...Object.values(cam.calc(f[0])))
				for (var j=1;j<5;j++){
					c.lineTo(...Object.values(cam.calc(f[j%4])))
				}
				c.fill()
			}
		}
		c.restore()
	}
	data(cnf){
		this._cnf._lS=cnf.lineCap||this._cnf._lS
		this._cnf._lW=cnf.lineWeight||this._cnf._lW
		this._cnf._lC=(cnf.lineColor==undefined&&cnf.lineColor!=null?this._cnf._lC:cnf.lineColor)
		this._cnf._sC[0]=(cnf.sideColor[0]==undefined&&cnf.sideColor[0]!=null?this._cnf._sC[0]:cnf.sideColor[0])
		this._cnf._sC[1]=(cnf.sideColor[1]==undefined&&cnf.sideColor[1]!=null?this._cnf._sC[1]:cnf.sideColor[1])
		this._cnf._sC[2]=(cnf.sideColor[2]==undefined&&cnf.sideColor[2]!=null?this._cnf._sC[2]:cnf.sideColor[2])
		this._cnf._sC[3]=(cnf.sideColor[3]==undefined&&cnf.sideColor[3]!=null?this._cnf._sC[3]:cnf.sideColor[3])
		this._cnf._sC[4]=(cnf.sideColor[4]==undefined&&cnf.sideColor[4]!=null?this._cnf._sC[4]:cnf.sideColor[4])
		this._cnf._sC[5]=(cnf.sideColor[5]==undefined&&cnf.sideColor[5]!=null?this._cnf._sC[5]:cnf.sideColor[5])
	}
	transform(m){
		var k=m._ud(this.x,this.y,this.z)
		for (var v of this._l){
			v.transform(k)
		}
		if (this._st.length!=0){
			for (var v of this._st){
				v.transform(k)
			}
		}
	}
	store(){
		this._st=this._l.slice()
	}
	restore(){
		if (this._st.length!=0){this._l=this._st.slice()}
	}
}
class _Cam{
	constructor(f){
		this.fov=f||100
		this._sc=null
		this._tk=new TransformMatrix(["blank"])
	}
	_st(sc){
		this._sc=sc
	}
	_appt(tr){
		this._tk.dt=this._tk.dt.concat(tr.dt)
		this._tk._rc()
	}
}
class PerspectiveCamera extends _Cam{
	constructor(fov){
		super(fov)
	}
	calc(p){
		var k=p.copy()
		k.transform(this._tk)
		var sc=this.fov/(k.z+this.fov)
		return {x:sc*k.x+this._sc._w.width/2,y:sc*k.y+this._sc._w.height/2}
	}
}
class OrtographicCamera extends _Cam{
	constructor(fov){
		super(fov)
	}
	calc(p){
		var k=p.copy()
		k.transform(this._tk)
		return {x:k.x+this._sc._w.width/2,y:k.y+this._sc._w.height/2}
	}
}
class TransformMatrix extends _Mat{
	_ud(x,y,z){
		var dt=this.dt.slice()
		for (var k of dt){
			k.push(x)
			k.push(y)
			k.push(z)
		}
		return new TransformMatrix(...dt)
	}
	_rc(){
		this.data=this._t[this.dt[0][0]](...this.dt[0].slice().splice(1,this.dt[0].length))
		for (var k of this.dt.slice().splice(1,this.dt.length-1)){
			var m=new _Mat(this._t[k[0]](...k.slice().splice(1,k.length)))
			this.mult(m)
		}
	}
	constructor(...dt){
		super([[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]])
		function radians(a){return (a%360)*(Math.PI/180)}
		function sin(a){return Math.round(Math.sin(a%360)*1000000000)/1000000000}
		function cos(a){return Math.round(Math.cos(a%360)*1000000000)/1000000000}
		this._t={}
		this._t.blank=function(){return [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]}
		this._t.translate=function(a,b,c){return [[1,0,0,a],[0,1,0,b],[0,0,1,c],[0,0,0,1]]}
		this._t.scale=function(a,b,c,fa,fb,fc){fa=fa||0;fb=fb||0;fc=fc||0;return [[a,0,0,fa*(1-a)],[0,b,0,fb*(1-b)],[0,0,c,fc*(1-c)],[0,0,0,1]]}
		this._t.rotX=function(a,fa,fb,fc){fa=fa||0;fb=fb||0;fc=fc||0;a=radians(a);return [[1,0,0,0],[0,cos(a),-sin(a),fb*(1-cos(a))+fc*sin(a)],[0,sin(a),cos(a),fc*(1-cos(a))+fb*sin(a)],[0,0,0,1]]}
		this._t.rotY=function(a,fa,fb,fc){fa=fa||0;fb=fb||0;fc=fc||0;a=radians(a);return [[cos(a),0,-sin(a),fa*(1-cos(a))+fc*sin(a)],[0,1,0,0],[sin(a),0,cos(a),fc*(1-cos(a))+fa*sin(a)],[0,0,0,1]]}
		this._t.rotZ=function(a,fa,fb,fc){fa=fa||0;fb=fb||0;fc=fc||0;a=radians(a);return [[cos(a),-sin(a),0,fa*(1-cos(a))+fb*sin(a)],[sin(a),cos(a),0,fb*(1-cos(a))+fa*sin(a)],[0,0,1,0],[0,0,0,1]]}
		this.dt=dt.slice()
		this._rc()
	}
	clear(){
		this.data=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]
		this.dt=[["blank"]]
	}
}