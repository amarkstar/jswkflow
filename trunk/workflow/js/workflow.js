function UIComponent(){
	
};
UIComponent.prototype.getPosition = function(){
	return HtmlUtil.getCoords(this.getUI());
};

UIComponent.prototype.getUI = function(){
	return this.ui;
};

function TaskNode(w,h,container,id){
	this.id = id;
	this.container = container;
	this.componentType = Constants.COMPONENT_TYPE_NODE;
	this.ui =  HtmlUtil.newElement('<div onselectstart="javascript:return false;" style="position:absolute;z-index:5;" class="workflow-node"></div>');
	this.beginLine = [];/*������ڵ��ȥ���ߵļ���*/
	this.endLine = [];/*ָ������ڵ���ߵļ���*/
	this.beginPolyLine = [];
	this.endPolyLine = [];
	this.beforeNode = [];/*��һ���ڵ�,�����Ƕ��*/
	this.nextNode =[];/*��һ���ڵ㣬�����Ƕ��*/
	this.canDrag = true;
	this.canDrop = true;
	HtmlUtil.setWidth(this.getUI(),w);
	HtmlUtil.setHeight(this.getUI(),h);

	this.rectDiv_top = new RectZone(this,Constants.RectZone_TOP,50,10);
	HtmlUtil.setLeft(this.rectDiv_top.getUI(),(Math.round(w/2)-Math.round(this.rectDiv_top.w/2))+"px");
	HtmlUtil.setTop(this.rectDiv_top.getUI(),"0px");

	this.rectDiv_left = new RectZone(this,Constants.RectZone_LEFT,10,20);
	HtmlUtil.setLeft(this.rectDiv_left.getUI(),"0px");
	HtmlUtil.setTop(this.rectDiv_left.getUI(),(Math.round(h/2)-Math.round(this.rectDiv_left.h/2))+"px");
	
	this.rectDiv_right = new RectZone(this,Constants.RectZone_RIGHT,10,20);
	HtmlUtil.setRight(this.rectDiv_right.getUI(),"0px");
	HtmlUtil.setTop(this.rectDiv_right.getUI(),(Math.round(h/2)-Math.round(this.rectDiv_right.h/2))+"px");
	
	this.rectDiv_bottom = new RectZone(this,Constants.RectZone_BOTTOM,50,10);
	HtmlUtil.setLeft(this.rectDiv_bottom.getUI(),(Math.round(w/2)-Math.round(this.rectDiv_bottom.w/2))+"px");
	HtmlUtil.setBottom(this.rectDiv_bottom.getUI(),"0px");

	HtmlUtil.append(this.getUI(),this.rectDiv_top.getUI());
	HtmlUtil.append(this.getUI(),this.rectDiv_left.getUI());
	HtmlUtil.append(this.getUI(),this.rectDiv_right.getUI());
	HtmlUtil.append(this.getUI(),this.rectDiv_bottom.getUI());

	var content = new NodeContent(container.operationMode,"node"+id);
	HtmlUtil.append(this.getUI(),content.getUI());

	/* ɾ��UI ÿ��component������ node line polyline*/
	this.removeUI = function(){
		HtmlUtil.remove(this.getUI());/*�ڵ㱾��ɾ��*/
		/*ɾ���ڵ��ϵ�����*/
		this.rectDiv_top = null;
		this.rectDiv_left = null;
		this.rectDiv_right = null;
		this.rectDiv_bottom = null;
		/*�ڵ��ϵ�lineɾ��*/
		for(var i =0,j=this.beginLine.length;i<j;i++){
			var line = this.beginLine[i];
			this.container.deleteComponent(line);
		}
		for(var i =0,j=this.endLine.length;i<j;i++){
			var line = this.endLine[i];
			this.container.deleteComponent(line);
		}
		for(var i =0,j=this.beginPolyLine.length;i<j;i++){
			var line = this.beginPolyLine[i];
			this.container.deleteComponent(line);
		}
		for(var i =0,j=this.endPolyLine.length;i<j;i++){
			var line = this.endPolyLine[i];
			this.container.deleteComponent(line);
		}
		/*��beforeNode��nextNode��ɾ���Լ�*/
		for(var i =0,j=this.beforeNode.length;i<j;i++){
			var tmp = this.beforeNode[i];
			tmp.nextNode.removeObj(this);
		}
		/*��nextNode��beforeNode��ɾ���Լ�*/
		for(var i =0,j=this.nextNode.length;i<j;i++){
			var tmp = this.nextNode[i];
			tmp.beforeNode.removeObj(this);
		}
	}
	
	this.canAddLine = function(fromNode){
		if(fromNode == this){
			return false;/*�����Լ����Լ�*/
		}
		/*���beforeNode���Ѿ���fromNode�ˣ��Ͳ����ӣ�return false*/
		if(this.addBeforeNode(fromNode)){
			/*ͬʱ��fromnode��nextnodeָ���Լ�*/
			fromNode.addNextNode(this);
			return true;
		}else{
			return false;
		}
	}
	new NodeListener(this);
}
TaskNode.prototype =  new UIComponent();
TaskNode.prototype.showController = function(){
	HtmlUtil.addClass(this.getUI(),"node-selected");
}
TaskNode.prototype.hideController = function(){
	HtmlUtil.removeClass(this.getUI(),"node-selected");
}

TaskNode.prototype.addBeforeNode =function(node){
	if(this.beforeNode.indexOf(node) == -1){
		this.beforeNode.push(node);
		return true;
	}else{
		return false;
	}
}
TaskNode.prototype.addNextNode =function(node){
	if(this.nextNode.indexOf(node) == -1){
		this.nextNode.push(node);
		return true;
	}else{
		return false;
	}
}

function NodeListener(node){
	var mouseOffset;
	var container = node.container;
	var containerPosition = container.getPosition();
	function onClick(e){
		container.unSelectAll();
		container.currentSelectedComponent = node;
		node.showController();
		e.stopPropagation();
	}
	
	function onMouseOver(e){
		if(node.container.operationMode == Constants.BTN_LINE_TYPE || node.container.operationMode == Constants.BTN_POLYLINE_TYPE){/*����ǻ���ģʽ��*/
			HtmlUtil.show(node.rectDiv_top.getUI());
			HtmlUtil.show(node.rectDiv_left.getUI());
			HtmlUtil.show(node.rectDiv_right.getUI());
			HtmlUtil.show(node.rectDiv_bottom.getUI());
		}
		e.stopPropagation();

	}

	function onMouseOut(e){
		if(node.container.operationMode == Constants.BTN_LINE_TYPE || node.container.operationMode == Constants.BTN_POLYLINE_TYPE){/*����ǻ���ģʽ��*/
			HtmlUtil.hide(node.rectDiv_top.getUI());
			HtmlUtil.hide(node.rectDiv_left.getUI());
			HtmlUtil.hide(node.rectDiv_right.getUI());e.stopPropagation();
			HtmlUtil.hide(node.rectDiv_bottom.getUI());
		}
		e.stopPropagation();
	}

	function onMouseMove(e){
		e  = e || window.event;
		var mousePos = HtmlUtil.mouseCoords(e);	
		var top = Math.max((mousePos.y - mouseOffset.y - containerPosition.y),0);
		HtmlUtil.setTop(node.getUI(),top + 'px');

		var left = Math.max((mousePos.x - mouseOffset.x - containerPosition.x),0);
		HtmlUtil.setLeft(node.getUI(),left + 'px');

		/*�������ڸýڵ��ϵ��ߵ���ֹ�������
		  �ӽڵ������ȥ���ߣ�����from*/
		for(var i=0,j=node.beginLine.length;i<j;i++){
			var line = node.beginLine[i];
			var lineOffset = line.beginPosOffset;
			line.setFrom(lineOffset.x+left,lineOffset.y+top);
		}
		/*���ӵ��ڵ���ߣ�����to*/
		for(var i=0,j=node.endLine.length;i<j;i++){
			var line = node.endLine[i];
			var lineOffset = line.endPosOffset;
			line.setTo(lineOffset.x+left,lineOffset.y+top);
		}
		/*�ӽڵ������ȥ���ߣ�����from*/
		for(var i=0,j=node.beginPolyLine.length;i<j;i++){
			var pline = node.beginPolyLine[i];
			var lineOffset = pline.beginPosOffset;
			pline.setFrom(lineOffset.x+left,lineOffset.y+top);
		}
		/*���ӵ��ڵ���ߣ�����to*/
		for(var i=0,j=node.endPolyLine.length;i<j;i++){
			var pline = node.endPolyLine[i];
			var lineOffset = pline.endPosOffset;
			pline.setTo(lineOffset.x+left,lineOffset.y+top);
		}
		e.stopPropagation();
	}

	function onMouseDown(e){
		container.unSelectAll();
		container.currentSelectedComponent = node;
		node.showController();
		if(container.operationMode == Constants.BTN_SELECT_TYPE || container.operationMode == Constants.BTN_NODE_TYPE){/*����ǻ��ڵ�ģʽ��*/
			$(node.getUI()).bind('mousemove',onMouseMove);
			$(node.getUI()).bind('mouseup',onMouseUp);
			mouseOffset = HtmlUtil.getMouseOffset(node.getUI(),e);
			node.getUI().setCapture();
		}else{
			$(node.getUI()).unbind('mousemove',onMouseMove);
			$(node.getUI()).unbind('mouseup',onMouseUp);
		}
	}

	function onMouseUp(e){
		/*�������ڸýڵ��ϵ��ߵ���ֹ�������
		  �ӽڵ������ȥ��ֱ�ߣ�����from*/
		for(var i=0,j=node.beginLine.length;i<j;i++){
			var line = node.beginLine[i];
			line.setControllerPosition();
		}
		/*���ӵ��ڵ��ֱ�ߣ�����to*/
		for(var i=0,j=node.endLine.length;i<j;i++){
			var line = node.endLine[i];
			line.setControllerPosition();
		}
		/*�ӽڵ������ȥ�����ߣ�����from*/
		for(var i=0,j=node.beginPolyLine.length;i<j;i++){
			var line = node.beginPolyLine[i];
			line.setControllerPosition();
		}
		/*���ӵ��ڵ�����ߣ�����to*/
		for(var i=0,j=node.endPolyLine.length;i<j;i++){
			var line = node.endPolyLine[i];
			line.setControllerPosition();
		}
		$(node.getUI()).unbind('mousemove',onMouseMove);
		$(node.getUI()).unbind('mouseup',onMouseUp);
		e.stopPropagation();
		node.getUI().releaseCapture();
	}

	$(node.getUI()).bind('mousedown',onMouseDown);
	$(node.getUI()).bind('mouseover',onMouseOver);
	$(node.getUI()).bind('mouseout',onMouseOut);
	$(node.getUI()).bind('click',onClick);
}



function NodeContent(type,content){
	this.ui = HtmlUtil.newElement('<table  cellspacing=0 cellpadding=0  border=0>'+
									'<tr class="title">'+
										'<td align=middle valign="middle" width="20%">'+
											'<div class="'+type+'" style="width:16px;height:16px;margin-right:5px"></div>'+
										'</td>'+
										'<td class=txt align=middle valign="middle">'+content+'</td>'+
									'</tr>'+
								'</table>');
}
NodeContent.prototype = new UIComponent();

function RectZone(node,type,w,h){
	this.node = node;
	this.type = type;
	this.w = w;
	this.h= h;
	this.ui =  HtmlUtil.newElement('<div onselectstart="javascript:return false;" class="rect-zone" style="position:absolute;z-index:6;display:none;"></div>');
	HtmlUtil.setWidth(this.getUI(),this.w);
	HtmlUtil.setHeight(this.getUI(),this.h);

	this.getEdgePos = function(mousePos,container){
		var borderWidth = 1;
		var containerPos = container.getPosition();
		var recPos = this.getPosition();
		var result = {x:0,y:0};
		switch(this.type){
			case Constants.RectZone_TOP:
				result.x = mousePos.x-containerPos.x ;
				result.y = recPos.y-containerPos.y - borderWidth;
				break;
			case Constants.RectZone_RIGHT:
				result.x = recPos.x-containerPos.x+this.w;
				result.y = mousePos.y-containerPos.y;
				break;
			case Constants.RectZone_BOTTOM:
				result.x = mousePos.x-containerPos.x;
				result.y = recPos.y-containerPos.y + this.h;
				break;
			case Constants.RectZone_LEFT:
				result.x = recPos.x-containerPos.x - borderWidth;
				result.y = mousePos.y-containerPos.y;
				break;
		}
		return result;
	}

	this.addBeginLine = function(line){
		this.node.beginLine.push(line);
	}

	this.addEndLine = function(line){
		this.node.endLine.push(line);
	}

	this.addBeginPolyLine = function(polyline){
		this.node.beginPolyLine.push(polyline);
	}

	this.addEndPolyLine = function(polyline){
		this.node.endPolyLine.push(polyline);
	}

	this.getMiddlePoints = function(fromPos,toPos){
		/*top��bottom����*/
		if(this.type == Constants.RectZone_TOP || this.type == Constants.RectZone_BOTTOM){
			return  {x:parseInt(fromPos.x,10),y:parseInt(toPos.y,10)};/*�м��x���䣬y��toPos��*/
		}else{/*left right ����*/
			return  {x:parseInt(toPos.x,10),y:parseInt(fromPos.y,10)};/*�м��y���䣬x��fromPos��*/
		}
	}
	new RectZoneListener(this);
}
RectZone.prototype =  new UIComponent();

function RectZoneListener(rect){
	var container = rect.node.container;

	function onMouseOver(e){
		if(!container.startDraw){
			if(rect.node.canDrag){
				container.fromNode = rect;
			}
		}else{
			if(rect.node.canDrop){
				container.toNode = rect;
			}
		}
	}

	function onMouseOut(e){
		if(!container.startDraw){
			container.fromNode = null;
		}else{
			container.toNode = null;
		}
	}
	$(rect.getUI()).bind('mouseover',onMouseOver);
	$(rect.getUI()).bind('mouseout',onMouseOut);
}

function Container(){
	this.id = 1;
	this.operationMode = Constants.BTN_NODE_TYPE;
	this.fromNode = null;/* �ߴ��ĸ�����(RectZone)��ʼ*/
	this.toNode = null;/*�����ĸ�����(RectZone)����*/
	this.startDraw = false;
	this.ui = HtmlUtil.newElement('<div onselectstart="javascript:return false;" class="workflow-container" style="position:relative;top:35px;"></div>');
    this.lines = [];
	this.nodes = [];
	this.polyLines = [];
	this.currentSelectedComponent;

	this.addNode = function(node,mousePos){
		var containerPos = this.getPosition();
		HtmlUtil.setLeft(node.getUI(),(mousePos.x-containerPos.x)+"px");
		HtmlUtil.setTop(node.getUI(),(mousePos.y-containerPos.y)+"px");
		HtmlUtil.prepend(this.getUI(),node.getUI()); 
		this.nodes.push(node);
	}

	this.addLine = function(line,mousePos){
		var fromNodePos = this.fromNode.node.getPosition();/*��ʼ��ק�Ľڵ�ľ���λ��*/
		var containerPos = this.getPosition();/*���container�ľ���λ��*/
		/*Ŀǰ����������node�·���������ʼλ�þ���fromRect��λ�ã����Ͻǣ�*/
		var fromPos = container.fromNode.getEdgePos(mousePos,container);
		line.setFrom(fromPos.x,fromPos.y);
		line.setTo(fromPos.x,fromPos.y);
		/*����������ʼ�ڵ��ϵ����λ�ã��Ա��Ժ�ڵ��ƶ�ʱ����*/
		line.beginPosOffset = {x:fromPos.x-fromNodePos.x+containerPos.x,y:fromPos.y-fromNodePos.y+containerPos.y};
		HtmlUtil.prepend(this.getUI(),line.getUI());
		this.lines.push(line);
		return {x:mousePos.x,y:mousePos.y};
	}

	this.addPolyLine = function(polyLine){
		HtmlUtil.prepend(this.getUI(),polyLine.getUI());
		this.polyLines.push(polyLine);
	}

	this.deleteComponent = function(component){
		if(!component){
			return;
		}
		component.removeUI();
		switch(component.componentType){
			case Constants.COMPONENT_TYPE_LINE:
				this.lines.removeObj(component);
				break;
			case Constants.COMPONENT_TYPE_NODE:
				this.nodes.removeObj(component);
				break;
			case Constants.COMPONENT_TYPE_POLYLINE:
				this.polyLines.removeObj(component);
				break;
		}
		component = null;
	}

	this.unSelectAll = function(){
		this.currentSelectedComponent = null;
		for(var i = 0,j=this.lines.length;i<j;i++){
			this.lines[i].hideController();
		};
		for(var i = 0,j=this.nodes.length;i<j;i++){
			this.nodes[i].hideController();
		};
		for(var i = 0,j=this.polyLines.length;i<j;i++){
			this.polyLines[i].hideController();
		}
	}
	new ContainerListener(this);
}
Container.prototype =  new UIComponent();

function ContainerListener(container){
	var line;
	var containerPosition;
	var startPos;

	function onClick(e){
		var mousePos = HtmlUtil.mouseCoords(e);	
		container.unSelectAll();/*���ѡ�е���������˵�ǰ����������*/
		switch(container.operationMode){
			case Constants.BTN_SELECT_TYPE:			
				break;
			case Constants.BTN_NODE_TYPE:
				/*����������ӽڵ�ģʽ�������󴴽�һ��node��Ȼ��ӵ����λ��*/
				var node = new TaskNode(100,40,container,container.id);
				container.id ++;
				container.addNode(node,mousePos);
				break;
			case Constants.BTN_STARTNODE_TYPE:
				var node = new StartNode(100,40,container,container.id);
				container.id ++;
				container.addNode(node,mousePos);
				break;
			case Constants.BTN_ENDNODE_TYPE:
				var node = new EndNode(100,40,container,container.id);
				container.id ++;
				container.addNode(node,mousePos);
				break;
			case Constants.BTN_LINE_TYPE:
				break;
		}
	}

	function onMouseDown(e){
		/*����ǻ���ģʽ��*/
		if(container.operationMode == Constants.BTN_LINE_TYPE || container.operationMode == Constants.BTN_POLYLINE_TYPE){
			/*���fromnode��ֵ��˵�����Կ�ʼ����*/
			if(container.fromNode != null){
				line = new Line(container,container.id);
				container.id ++;
				var mousePos = HtmlUtil.mouseCoords(e);
				startPos = container.addLine(line,mousePos);/*������꿪ʼ���ߵ�λ��*/
				container.startDraw = true;/*��container��Ϊ��ʼ����*/
				$(container.getUI()).bind('mousemove',onMouseMove);
				$(container.getUI()).bind('mouseup',onMouseUp);
				containerPosition = container.getPosition();
			}
		}
	}

	function onMouseMove(e){
		e  = e || window.event;
		var mousePos = HtmlUtil.mouseCoords(e);
		if(mousePos.x<=startPos.x){
			line.setTo(mousePos.x-containerPosition.x+3,mousePos.y-containerPosition.y+2);
		}else{
			line.setTo(mousePos.x-containerPosition.x-3,mousePos.y-containerPosition.y-2);
		}
	}

	function onMouseUp(e){
		e  = e || window.event;
		var mousePos = HtmlUtil.mouseCoords(e);
		/*����ɿ�����λ���ǻ���������toNode��ֵ�Ļ������ߣ�����ɾ��line*/
		if(container.toNode == null || !container.toNode.node.canAddLine(container.fromNode.node)){
			container.deleteComponent(line);
		}else{
			var toPos = container.toNode.getEdgePos(mousePos,container);
			line.setTo(toPos.x,toPos.y);
			/*�������ڽ����ڵ��ϵ����λ�ã��Ա��Ժ�ڵ��ƶ�ʱ����*/
			var toNodePos = container.toNode.node.getPosition();/*���������ڽڵ�ľ���λ��*/
			var containerPos = container.getPosition();/*���container�ľ���λ��*/
			line.endPosOffset = {x:toPos.x-(toNodePos.x-containerPos.x),y:toPos.y-(toNodePos.y-containerPos.y)};
			if(container.operationMode == Constants.BTN_LINE_TYPE){/*����ǻ�ֱ��ģʽ��*/
				line.finishLine();
				/*���߷ֱ�ֵ�����ӵ�����node��beginLine��endLine*/
				container.fromNode.addBeginLine(line);
				container.toNode.addEndLine(line);
				line.beginNode = container.fromNode.node;
				line.endNode = container.toNode.node;
			}
			if(container.operationMode == Constants.BTN_POLYLINE_TYPE){/*����ǻ����ߵ�ģʽ*/
				/*����fromZone�����from to middle������*/
				var middlePos = container.fromNode.getMiddlePoints(line.getFrom(),line.getTo());
				/*�������ߣ������߻���container��*/
				var polyLine = new PolyLine(container,container.id);
				container.id ++;
				container.addPolyLine(polyLine);
				polyLine.setFrom(line.getFrom().x,line.getFrom().y);
				polyLine.setTo(line.getTo().x,line.getTo().y);
				polyLine.setMiddle(middlePos.x,middlePos.y);
				polyLine.beginPosOffset = line.beginPosOffset;
				polyLine.endPosOffset = line.endPosOffset;
				polyLine.finishLine();
				polyLine.addController(container);
				/*Ȼ��ɾ��line*/
				container.deleteComponent(line);
				container.fromNode.addBeginPolyLine(polyLine);
				container.toNode.addEndPolyLine(polyLine);
				polyLine.beginNode = container.fromNode.node;
				polyLine.endNode = container.toNode.node;
			}
		}

		$(container.getUI()).unbind('mousemove');
		$(container.getUI()).unbind('mouseup');
		container.toNode = null;
		container.fromNode = null;
		container.startDraw = false;
		e.stopPropagation();
	}

	$(container.getUI()).bind('click',onClick);
	$(container.getUI()).bind('mousedown',onMouseDown);
}

function Line(container,id){
	this.id = id;
	this.componentType = Constants.COMPONENT_TYPE_LINE;
	this.container = container;
	this.ui = HtmlUtil.newElement('<v:line style="position:absolute;z-index:11;"></v:line>');
	this.arrow = HtmlUtil.newElement('<v:Stroke dashstyle="solid" endarrow="classic"/>');
	/*�߷����ˣ�begin�˺�end�ˣ��������������������¼�ߵ��������ڸ��Ե�node�ϵ�ƫ���������ڵ�node��קʱ���¶����ߵ�λ��*/
	this.beginPosOffset;
	this.endPosOffset;
	this.fromPos;/*ע�⣬�������container������*/
	this.toPos;/*ע�⣬�������container������*/
	this.beginController;
	this.endController;
	this.beginNode;
	this.endNode;

	/*begin��endcontroller ����,���ݷ���������begin��endcontroller��top��left(���line���������container)*/
	this.setControllerPosition = function(){
		if(!this.beginController || !this.endController){
			return;
		}
		var direction = Line._getDirection(this.getFrom(),this.getTo());
		switch(direction){
			case Constants.DIRECTION_LT:
				HtmlUtil.setLeft(this.endController.getUI(),0+"px");
				HtmlUtil.setTop(this.endController.getUI(),0+"px");
				HtmlUtil.setLeft(this.beginController.getUI(),Math.abs(this.getFrom().x-this.getTo().x)+"px");
				HtmlUtil.setTop(this.beginController.getUI(),Math.abs(this.getFrom().y-this.getTo().y)+"px");
				break;
			case Constants.DIRECTION_RT:
				HtmlUtil.setLeft(this.beginController.getUI(),0+"px");
				HtmlUtil.setTop(this.beginController.getUI(),Math.abs(this.getFrom().y-this.getTo().y)+"px");
				HtmlUtil.setLeft(this.endController.getUI(),Math.abs(this.getFrom().x-this.getTo().x)+"px");
				HtmlUtil.setTop(this.endController.getUI(),0+"px");
				break;
			case Constants.DIRECTION_LB:
				HtmlUtil.setLeft(this.endController.getUI(),0+"px");
				HtmlUtil.setTop(this.endController.getUI(),Math.abs(this.getFrom().y-this.getTo().y)+"px");
				HtmlUtil.setLeft(this.beginController.getUI(),Math.abs(this.getFrom().x-this.getTo().x)+"px");
				HtmlUtil.setTop(this.beginController.getUI(),0+"px");
				break;
			case Constants.DIRECTION_RB:
				HtmlUtil.setLeft(this.beginController.getUI(),0+"px");
				HtmlUtil.setTop(this.beginController.getUI(),0+"px");
				HtmlUtil.setLeft(this.endController.getUI(),Math.abs(this.getFrom().x-this.getTo().x)+"px");
				HtmlUtil.setTop(this.endController.getUI(),Math.abs(this.getFrom().y-this.getTo().y)+"px");
				break;
		}

	}
	new LineListener(this);

}
Line.prototype = new UIComponent();

Line.prototype.setFrom = function(x,y){
	this.fromPos = {x:parseInt(x,10),y:parseInt(y,10)};
	this.getUI().from = x + ',' + y;	
}
Line.prototype.getFrom = function(){
	return this.fromPos;
}
Line.prototype.setTo = function(x,y){
	this.toPos = {x:parseInt(x,10),y:parseInt(y,10)};
	this.getUI().to = x + ',' + y;
}
Line.prototype.getTo = function(){
	return this.toPos;
}
Line.prototype.showController = function(){
	HtmlUtil.show(this.beginController.getUI());
	HtmlUtil.show(this.endController.getUI());
}
Line.prototype.hideController = function(){
	HtmlUtil.hide(this.beginController.getUI());
	HtmlUtil.hide(this.endController.getUI());
}
/* ɾ��UI*/
Line.prototype.removeUI = function(){
	HtmlUtil.remove(this.getUI());
	/*��beginNode�ϵ�beginLine����Լ�ɾ��*/
	if(this.beginNode){
		this.beginNode.beginLine.removeObj(this);
		/*��beforeNode��nextNode��ɾ��line.endNode*/
		this.beginNode.nextNode.removeObj(this.endNode);
	}
	/*��endNode�ϵ�endLine����Լ�ɾ��*/
	if(this.endNode){
		this.endNode.endLine.removeObj(this);
		/*��endNode��beforeNode��ɾ��line.beginNode*/
		this.endNode.beforeNode.removeObj(this.beginNode);
	}
}
Line.prototype.finishLine = function(){
	/*���߻��ϼ�ͷ�����Ͽ��Ƶ�*/
	HtmlUtil.append(this.getUI(),this.arrow);
	this.beginController = new LineController(this.container,this,5,5);
	this.endController = new LineController(this.container,this,5,5);
	HtmlUtil.append(this.getUI(),this.beginController.getUI());
	HtmlUtil.append(this.getUI(),this.endController.getUI());
	this.setControllerPosition();
}


Line._getDirection = function(beginPos,endPos){
	if((endPos.x>=beginPos.x) && (endPos.y<=beginPos.y)){
		return Constants.DIRECTION_RT;
	};
	if((endPos.x>=beginPos.x) && (endPos.y>=beginPos.y)){
		return Constants.DIRECTION_RB;
	};
	if((endPos.x<beginPos.x) && (endPos.y<beginPos.y)){
		return Constants.DIRECTION_LT;
	};
	if((endPos.x<beginPos.x) && (endPos.y>beginPos.y)){
		return Constants.DIRECTION_LB;
	};
}

function LineController(container,line,w,h){
	this.line = line;
	this.w = w;
	this.h= h;
	this.container = container;

	this.ui =  HtmlUtil.newElement('<div onselectstart="javascript:return false;" class="controller-zone" style="position:absolute;z-index:12;display:none;"></div>');
	this.getUI = function(){
		return this.ui;
	};

	HtmlUtil.setWidth(this.getUI(),this.w);
	HtmlUtil.setHeight(this.getUI(),this.h);

	this.getPosition = function(){
		return HtmlUtil.getCoords(this.getUI());
	};
}
function LineListener(line){
    var onClick = function(e){
		line.container.unSelectAll();
		line.container.currentSelectedComponent = line;
		line.showController();
		e.stopPropagation();
	};
	$(line.getUI()).bind('click',onClick);
}

function PolyLine(container,id){
	Line.call(this,container,id);
	this.componentType = Constants.COMPONENT_TYPE_POLYLINE;
	this.controller;//�м�Ŀ��Ƶ�
	this.ui = HtmlUtil.newElement('<v:polyline filled="false" style="position:absolute;z-index:11;"></v:polyline>');
	this.arrow = HtmlUtil.newElement('<v:Stroke dashstyle="solid" endarrow="classic"/>');
	this.middlePos;
	this.direction;

	this.setFrom = function(x,y){
		this.fromPos = x + "," + y;
		this.getUI().points.value = this.fromPos + " " + this.middlePos +" "+ this.toPos;
	}

	this.getFrom = function(){
		var fromArr = this.fromPos.split(",");
		return {x:parseInt(fromArr[0],10),y:parseInt(fromArr[1],10)};
	}
	
	this.setMiddle = function(x,y){
		this.middlePos = x + "," + y;
		this.getUI().points.value = this.fromPos + " " + this.middlePos +" "+ this.toPos;
	}

	this.getMiddle = function(){
		var middleArr = this.middlePos.split(",");
		return {x:parseInt(middleArr[0],10),y:parseInt(middleArr[1],10)};
	}

	this.setTo = function(x,y){
		this.toPos = x + "," + y;
		this.getUI().points.value = this.fromPos + " " + this.middlePos +" "+ this.toPos;
	}

	this.getTo = function(){
		var toArr = this.toPos.split(",");
		return {x:parseInt(toArr[0],10),y:parseInt(toArr[1],10)};
	}	

	this.addController = function(container){
		this.controller = new PolyLineController(container,this,5,5);
		HtmlUtil.setLeft(this.controller.getUI(),this.getMiddle().x-Math.round(this.controller.w/2)+"px");
		HtmlUtil.setTop(this.controller.getUI(),this.getMiddle().y-Math.round(this.controller.h/2)+"px");
		HtmlUtil.after(this.getUI(),this.controller.getUI());
	}

	/*ɾ��UI ÿ��component������ node line polyline*/
	this.removeUI = function(){
		HtmlUtil.remove(this.getUI());
		HtmlUtil.remove(this.controller.getUI());
		this.controller=null;
		/*��beginNode�ϵ�beginLine����Լ�ɾ��*/
		if(this.beginNode){
			this.beginNode.beginPolyLine.removeObj(this);
			/*��beforeNode��nextNode��ɾ��line.endNode*/
			this.beginNode.nextNode.removeObj(this.endNode);
		}
		/*��endNode�ϵ�endLine����Լ�ɾ��*/
		if(this.endNode){
			this.endNode.endPolyLine.removeObj(this);
			/*��endNode��beforeNode��ɾ��line.beginNode*/
			this.endNode.beforeNode.removeObj(this.beginNode);
		}
	}
	
	new LineListener(this);
}

PolyLine.prototype = new Line(); 

function PolyLineController(container,pline,w,h){
	this.pline = pline;
	this.w = w;
	this.h= h;
	this.container = container;
	
	this.ui =  HtmlUtil.newElement('<div onselectstart="javascript:return false;" class="rect-zone" style="position:absolute;z-index:12;"></div>');

	HtmlUtil.setWidth(this.getUI(),this.w);
	HtmlUtil.setHeight(this.getUI(),this.h);

	new PolyLineControllerListener(this);
}
PolyLineController.prototype = new UIComponent();


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

		/*�ƶ���ͬʱ������polyline��middlePoint����*/
		controller.pline.setMiddle(left,top);
		e.stopPropagation();
	}

	function onMouseDown(e){
		if(container.operationMode == Constants.BTN_SELECT_TYPE){/*�����ѡ��ģʽ��*/
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

function StartNode(w,h,container,id){
	TaskNode.call(this,w,h,container,id);
	this.canDrop = false;
}

StartNode.prototype = TaskNode.prototype;

function EndNode(w,h,container,id){
	TaskNode.call(this,w,h,container,id);
	this.canDrag = false;

}

EndNode.prototype =  TaskNode.prototype;

function Button(toolbar,type){
	this.toolbar = toolbar;
	this.type = type;
	this.ui = HtmlUtil.newElement('<div class="workflow-btn '+ type +'" style="position:absolute;"></div>');
	new ButtonListener(this);
}
Button.prototype = new UIComponent();
Button.prototype.setLeft = function(l){
	HtmlUtil.setLeft(this.getUI(),l);
}
Button.prototype.setTop = function(t){
	HtmlUtil.setTop(this.getUI(),t);
}
Button.prototype.setPressed = function(){
	HtmlUtil.addClass(this.getUI(),"pressed");
}
Button.prototype.cancelPressed = function(){
	HtmlUtil.removeClass(this.getUI(),"pressed");
}
function ButtonListener(button){
	var onClick = function(e){
		button.toolbar.setPressed(button.type);
		button.setPressed();
	};

	$(button.getUI()).bind("click",onClick);
}

function DeleteButton(toolbar){
	this.toolbar = toolbar;
	this.type = Constants.BTN_DELETE_TYPE;
	this.ui = HtmlUtil.newElement('<div class="workflow-btn '+ this.type +'" style="position:absolute;"></div>');
	new DelButtonListener(this);

}
DeleteButton.prototype = Button.prototype;

function DelButtonListener(button){
	var onMouseDown = function(e){
		button.setPressed();
	};

	var onMouseUp = function(e){
		button.cancelPressed();
		var container = button.toolbar.container;
		container.deleteComponent(container.currentSelectedComponent);
	};
	
	$(button.getUI()).bind("mousedown",onMouseDown);
	$(button.getUI()).bind("mouseup",onMouseUp);
}

function ToolBar(container){
	this.ui = HtmlUtil.newElement('<div class="workflow-toolbar" style="position:absolute;"></div>');
	this.container = container;
	var btns = [];

	var btn_select = new Button(this,Constants.BTN_SELECT_TYPE);
	btn_select.setTop("5px");
	btn_select.setLeft("2px");
	btns.push(btn_select);

	var btn_line = new Button(this,Constants.BTN_LINE_TYPE);
	btn_line.setTop("5px");
	btn_line.setLeft("27px");
	btns.push(btn_line);

	var btn_polyline = new Button(this,Constants.BTN_POLYLINE_TYPE);
	btn_polyline.setTop("5px");
	btn_polyline.setLeft("52px");
	btns.push(btn_polyline);

	var btn_node = new Button(this,Constants.BTN_NODE_TYPE);
	btn_node.setTop("5px");
	btn_node.setLeft("77px");
	btns.push(btn_node);

	var btn_startnode = new Button(this,Constants.BTN_STARTNODE_TYPE);
	btn_startnode.setTop("5px");
	btn_startnode.setLeft("102px");
	btns.push(btn_startnode);

	var btn_endnode = new Button(this,Constants.BTN_ENDNODE_TYPE);
	btn_endnode.setTop("5px");
	btn_endnode.setLeft("127px");
	btns.push(btn_endnode);

	var btn_delete = new DeleteButton(this);
	btn_delete.setTop("5px");
	btn_delete.setLeft("152px");
	btns.push(btn_delete);

	HtmlUtil.append(this.getUI(),btn_select.getUI());
	HtmlUtil.append(this.getUI(),btn_line.getUI());
	HtmlUtil.append(this.getUI(),btn_polyline.getUI());
	HtmlUtil.append(this.getUI(),btn_node.getUI());
	HtmlUtil.append(this.getUI(),btn_startnode.getUI());
	HtmlUtil.append(this.getUI(),btn_endnode.getUI());
	HtmlUtil.append(this.getUI(),btn_delete.getUI());

	this.setPressed = function(type){
		this.container.operationMode = type;
		if(this.container.operationMode == Constants.BTN_POLYLINE_TYPE || this.container.operationMode == Constants.BTN_LINE_TYPE){
			$(this.container.getUI()).get(0).style.cursor = "crosshair";
		}else{
			$(this.container.getUI()).get(0).style.cursor = "default";
		}
		for(var i =0,j=btns.length;i<j;i++){
			btns[i].cancelPressed();
		}
	}
}

ToolBar.prototype = new UIComponent();