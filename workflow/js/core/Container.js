function Container(){
	this.operationMode = Constants.NODE_MOD;
	
	this.fromNode = null;// �ߴ��ĸ�����(RectZone)��ʼ
	this.toNode = null;//�����ĸ�����(RectZone)����
	this.startDraw = false;

	var ui = HtmlUtil.newElement('<div onselectstart="javascript:return false;" class="workflow-container" style="position:relative;"></div>');
	//var canvas = HtmlUtil.newElement('<v:group style="position:absolute;left:0;top:0;z-index:11;width:600px;height:600px;" coordsize="600,600"></v:group>');
	//HtmlUtil.append(ui,canvas);
	
	this.getUI = function(){
		return ui;
	}

    this.lines = [];
	this.nodes = [];
	this.polyLines = [];
	this.currentSelectedComponent;


	this.addNode = function(node,mousePos){
		var containerPos = this.getPosition();
		HtmlUtil.setLeft(node.getUI(),(mousePos.x-containerPos.x)+"px");
		HtmlUtil.setTop(node.getUI(),(mousePos.y-containerPos.y)+"px");
		HtmlUtil.prepend(ui,node.getUI()); 
		this.nodes.push(node);
	}

	this.addLine = function(line,mousePos){
		log.info("add line..........");
		var fromNodePos = this.fromNode.node.getPosition();//��ʼ��ק�Ľڵ�ľ���λ��
		var containerPos = this.getPosition();//���container�ľ���λ��
		//Ŀǰ����������node�·���������ʼλ�þ���fromRect��λ�ã����Ͻǣ�
		var fromPos = container.fromNode.getEdgePos(mousePos,container);
		line.setFrom(fromPos.x,fromPos.y);
		line.setTo(fromPos.x,fromPos.y);
		//����������ʼ�ڵ��ϵ����λ�ã��Ա��Ժ�ڵ��ƶ�ʱ����
		line.beginPosOffset = {x:fromPos.x-fromNodePos.x+containerPos.x,y:fromPos.y-fromNodePos.y+containerPos.y};
		HtmlUtil.prepend(ui,line.getUI());
		this.lines.push(line);
		return {x:mousePos.x,y:mousePos.y};
	}

	this.addPolyLine = function(polyLine){
		HtmlUtil.prepend(ui,polyLine.getUI());
		this.polyLines.push(polyLine);
	}

	this.deleteComponent = function(component){
		if(!component){
			return;
		}
		component.removeUI();
		switch(component.componentType){
			case Constants.COMPONENT_TYPE_LINE:
				var index = this.lines.indexOf(component);
				this.lines.removeByIndex(index);
				break;
			case Constants.COMPONENT_TYPE_NODE:
				var index = this.nodes.indexOf(component);
				this.nodes.removeByIndex(index);
				break;
			case Constants.COMPONENT_TYPE_POLYLINE:
				var index = this.polyLines.indexOf(component);
				this.polyLines.removeByIndex(index);
				break;
		}
		component = null;
	}

	this.getPosition = function(){
		return HtmlUtil.getCoords(this.getUI());
	}
	new ContainerListener(this);

	this.unSelectAll = function(){
		for(var i = 0,j=this.lines.length;i<j;i++){
			this.lines[i].hideController();
		}

		for(var i = 0,j=this.nodes.length;i<j;i++){
			//this.nodes[i].hideController();
		}

		for(var i = 0,j=this.polyLines.length;i<j;i++){
			this.polyLines[i].hideController();
		}
	}
}



function ContainerListener(container){
	var line;
	var containerPosition;
	
	var startPos;

	function onClick(e){
		var mousePos = HtmlUtil.mouseCoords(e);	
		switch(container.operationMode){
			case Constants.CHOSEN_MOD:
				
				break;
			case Constants.NODE_MOD:
				//���������ӽڵ�ģʽ�������󴴽�һ��node��Ȼ��ӵ����λ��
				var node = new TaskNode(100,40,container);
				container.addNode(node,mousePos);
				break;
			case Constants.LINE_MOD:

				break;
			
		}
	}

	function onMouseDown(e){
		
		if(container.operationMode == Constants.LINE_MOD || container.operationMode == Constants.POLYLINE_MOD){//����ǻ���ģʽ��
			//���fromnode��ֵ��˵�����Կ�ʼ����
			if(container.fromNode != null){
				log.info("canvas mouse down....."+container.fromNode);
				line = new Line(container);
				var mousePos = HtmlUtil.mouseCoords(e);
				startPos = container.addLine(line,mousePos);//������꿪ʼ���ߵ�λ��
				container.startDraw = true;//��container��Ϊ��ʼ����
				$(container.getUI()).bind('mousemove',onMouseMove);
				$(container.getUI()).bind('mouseup',onMouseUp);
				containerPosition = container.getPosition();
			}
		}
		
		e.stopPropagation();
		
	}

	function onMouseMove(e){
		e  = e || window.event;
		var mousePos = HtmlUtil.mouseCoords(e);

		if(mousePos.x<=startPos.x){
			line.setTo(mousePos.x-containerPosition.x+3,mousePos.y-containerPosition.y+2);
		}else{
			line.setTo(mousePos.x-containerPosition.x-3,mousePos.y-containerPosition.y-2);
		}
		
		e.stopPropagation();
	}

	function onMouseUp(e){
		log.info("canvas mouse up....."+container.toNode);
		e  = e || window.event;
		var mousePos = HtmlUtil.mouseCoords(e);
		//����ɿ�����λ���ǻ���������toNode��ֵ�Ļ������ߣ�����ɾ��line
		if(container.toNode == null){
			container.deleteComponent(line);
		}else{
			var toPos = container.toNode.getEdgePos(mousePos,container);
			line.setTo(toPos.x,toPos.y);
			//�������ڽ����ڵ��ϵ����λ�ã��Ա��Ժ�ڵ��ƶ�ʱ����
			var toNodePos = container.toNode.node.getPosition();//���������ڽڵ�ľ���λ��
			var containerPos = container.getPosition();//���container�ľ���λ��
			line.endPosOffset = {x:toPos.x-(toNodePos.x-containerPos.x),y:toPos.y-(toNodePos.y-containerPos.y)};
			if(container.operationMode == Constants.LINE_MOD){//����ǻ�ֱ��ģʽ��
				line.finishLine();
				
				//���߷ֱ�ֵ�����ӵ�����node��beginLine��endLine
				container.fromNode.addBeginLine(line);
				container.toNode.addEndLine(line);
			}
			if(container.operationMode == Constants.POLYLINE_MOD){//����ǻ����ߵ�ģʽ
				//���������ȷ������
				//var direction = _getDirection(startPos,mousePos);
				//����fromZone�����from to middle������
				var middlePos = container.fromNode.getMiddlePoints(line.getFrom(),line.getTo());
				
				
				//�������ߣ������߻���container�ϣ�
				var polyLine = new PolyLine(container);
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