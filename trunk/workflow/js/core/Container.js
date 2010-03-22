function Container(){
	this.id = 1;
	this.operationMode = Constants.BTN_NODE_TYPE;
	this.fromNode = null;// �ߴ��ĸ�����(RectZone)��ʼ
	this.toNode = null;//�����ĸ�����(RectZone)����
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
		var fromNodePos = this.fromNode.node.getPosition();//��ʼ��ק�Ľڵ�ľ���λ��
		var containerPos = this.getPosition();//���container�ľ���λ��
		//Ŀǰ����������node�·���������ʼλ�þ���fromRect��λ�ã����Ͻǣ�
		var fromPos = container.fromNode.getEdgePos(mousePos,container);
		line.setFrom(fromPos.x,fromPos.y);
		line.setTo(fromPos.x,fromPos.y);
		//����������ʼ�ڵ��ϵ����λ�ã��Ա��Ժ�ڵ��ƶ�ʱ����
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
		}
		for(var i = 0,j=this.nodes.length;i<j;i++){
			this.nodes[i].hideController();
		}
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
		container.unSelectAll();//���ѡ�е���������˵�ǰ����������
		switch(container.operationMode){
			case Constants.BTN_SELECT_TYPE:			
				break;
			case Constants.BTN_NODE_TYPE:
				//���������ӽڵ�ģʽ�������󴴽�һ��node��Ȼ��ӵ����λ��
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
		if(container.operationMode == Constants.BTN_LINE_TYPE || container.operationMode == Constants.BTN_POLYLINE_TYPE){//����ǻ���ģʽ��
			//���fromnode��ֵ��˵�����Կ�ʼ����
			if(container.fromNode != null){
				line = new Line(container,container.id);
				container.id ++;
				var mousePos = HtmlUtil.mouseCoords(e);
				startPos = container.addLine(line,mousePos);//������꿪ʼ���ߵ�λ��
				container.startDraw = true;//��container��Ϊ��ʼ����
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
		//����ɿ�����λ���ǻ���������toNode��ֵ�Ļ������ߣ�����ɾ��line
		if(container.toNode == null || !container.toNode.node.canAddLine(container.fromNode.node)){
			container.deleteComponent(line);
		}else{
			var toPos = container.toNode.getEdgePos(mousePos,container);
			line.setTo(toPos.x,toPos.y);
			//�������ڽ����ڵ��ϵ����λ�ã��Ա��Ժ�ڵ��ƶ�ʱ����
			var toNodePos = container.toNode.node.getPosition();//���������ڽڵ�ľ���λ��
			var containerPos = container.getPosition();//���container�ľ���λ��
			line.endPosOffset = {x:toPos.x-(toNodePos.x-containerPos.x),y:toPos.y-(toNodePos.y-containerPos.y)};
			if(container.operationMode == Constants.BTN_LINE_TYPE){//����ǻ�ֱ��ģʽ��
				line.finishLine();
				//���߷ֱ�ֵ�����ӵ�����node��beginLine��endLine
				container.fromNode.addBeginLine(line);
				container.toNode.addEndLine(line);
				line.beginNode = container.fromNode.node;
				line.endNode = container.toNode.node;
			}
			if(container.operationMode == Constants.BTN_POLYLINE_TYPE){//����ǻ����ߵ�ģʽ
				//����fromZone�����from to middle������
				var middlePos = container.fromNode.getMiddlePoints(line.getFrom(),line.getTo());
				//�������ߣ������߻���container�ϣ�
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
				//Ȼ��ɾ��line
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