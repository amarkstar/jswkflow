function PolyLine(container){
	this.container = container;
	this.componentType = Constants.COMPONENT_TYPE_POLYLINE;
	this.controller;

	var ui = HtmlUtil.newElement('<v:polyline filled="false" style="position:absolute;z-index:11;"></v:polyline>');
	var arrow = HtmlUtil.newElement('<v:Stroke dashstyle="solid" endarrow="classic"/>');

	this.fromPos;
	this.toPos;
	this.middlePos;

	this.direction;

	this.getUI = function(){
		return ui;
	}

	//�߷����ˣ�begin�˺�end�ˣ��������������������¼�ߵ��������ڸ��Ե�node�ϵ�ƫ���������ڵ�node��קʱ���¶����ߵ�λ��
	this.beginPosOffset;
	this.endPosOffset;

	this.setFrom = function(x,y){
		this.fromPos = x + "," + y;
		ui.points.value = this.fromPos + " " + this.middlePos +" "+ this.toPos;
	}

	this.getFrom = function(){
		var fromArr = this.fromPos.split(",");
		return {x:fromArr[0],y:fromArr[1]};
	}

	
	this.setMiddle = function(x,y){
		this.middlePos = x + "," + y;
		ui.points.value = this.fromPos + " " + this.middlePos +" "+ this.toPos;
	}

	this.getMiddle = function(){
		var middleArr = this.middlePos.split(",");
		return {x:middleArr[0],y:middleArr[1]};
	}

	this.setTo = function(x,y){
		this.toPos = x + "," + y;
		ui.points.value = this.fromPos + " " + this.middlePos +" "+ this.toPos;
	}

	this.getTo = function(){
		var toArr = this.toPos.split(",");
		return {x:toArr[0],y:toArr[1]};
	}

	this.setArrow = function(){
		HtmlUtil.append(ui,arrow);
	}
	

	this.addController = function(container){
		this.controller = new PolyLineController(container,this,5,5);
		//log.error("add controller...."+this.getMiddle().x)
		HtmlUtil.setLeft(this.controller.getUI(),this.getMiddle().x-Math.round(this.controller.w/2)+"px");
		HtmlUtil.setTop(this.controller.getUI(),this.getMiddle().y-Math.round(this.controller.h/2)+"px");
		HtmlUtil.after(ui,this.controller.getUI());
	}

	// ɾ��UI ÿ��component������ node line polyline
	this.removeUI = function(){
		HtmlUtil.remove(this.getUI());
		HtmlUtil.remove(this.controller.getUI());
		this.controller=null;	
	}
	
}

function PolyLineController(container,pline,w,h){
	this.pline = pline;
	this.w = w;
	this.h= h;
	this.container = container;

	var ui =  HtmlUtil.newElement('<div onselectstart="javascript:return false;" class="rect-zone" style="position:absolute;z-index:12;"></div>');
	HtmlUtil.setWidth(ui,this.w);
	HtmlUtil.setHeight(ui,this.h);
	this.getUI = function(){
		return ui;
	}

	this.getPosition = function(){
		return HtmlUtil.getCoords(this.getUI());
	}

	new PolyLineControllerListener(this);

	
}


function PolyLineControllerListener(controller){
	var mouseOffset;
	var container = controller.container;
	var containerPosition = container.getPosition();

	
	function onMouseMove(e){
		e  = e || window.event;
		var mousePos = HtmlUtil.mouseCoords(e);	
		var top = Math.max((mousePos.y - mouseOffset.y - containerPosition.y),0);
		HtmlUtil.setTop(controller.getUI(),top + 'px');

		var left = Math.max((mousePos.x - mouseOffset.x - containerPosition.x),0);
		HtmlUtil.setLeft(controller.getUI(),left + 'px');

		//�ƶ���ͬʱ������polyline��middlePoint����
		controller.pline.setMiddle(left,top);
		e.stopPropagation();
	}

	function onMouseDown(e){
		if(container.operationMode == Constants.CHOSEN_MOD){//�����ѡ��ģʽ��
			//log.info("node mouse down......"+container.operationMode)
			$(controller.getUI()).bind('mousemove',onMouseMove);
			$(controller.getUI()).bind('mouseup',onMouseUp);
			mouseOffset = HtmlUtil.getMouseOffset(controller.getUI(),e);
			controller.getUI().setCapture();
		}else{
			$(controller.getUI()).unbind('mousemove',onMouseMove);
			$(controller.getUI()).unbind('mouseup',onMouseUp);
		}
		e.stopPropagation();
	}

	function onMouseUp(e){
		
		$(controller.getUI()).unbind('mousemove',onMouseMove);
		$(controller.getUI()).unbind('mouseup',onMouseUp);
		e.stopPropagation();
		controller.getUI().releaseCapture();
	}

	$(controller.getUI()).bind('mousedown',onMouseDown);
}