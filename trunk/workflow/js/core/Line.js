function Line(container){
	this.componentType = Constants.COMPONENT_TYPE_LINE;
	this.container = container;
	var ui = HtmlUtil.newElement('<v:line style="position:absolute;z-index:11;"></v:line>');

	var arrow = HtmlUtil.newElement('<v:Stroke dashstyle="solid" endarrow="classic"/>');

	this.getUI = function(){
		return ui;
	}
	//�߷����ˣ�begin�˺�end�ˣ��������������������¼�ߵ��������ڸ��Ե�node�ϵ�ƫ���������ڵ�node��קʱ���¶����ߵ�λ��
	this.beginPosOffset;
	this.endPosOffset;
	this.fromPos;//ע�⣬�������container������
	this.toPos;//ע�⣬�������container������
	this.beginController;
	this.endController;


	this.setFrom = function(x,y){
		this.fromPos = {x:x,y:y};
		this.getUI().from = x + ',' + y;
		
	}

	this.setTo = function(x,y){
		this.toPos = {x:x,y:y};
		this.getUI().to = x + ',' + y;
		
	}

	this.showController = function(){
		HtmlUtil.show(this.beginController.getUI());
		HtmlUtil.show(this.endController.getUI());
	}

	this.hideController = function(){
		HtmlUtil.hide(this.beginController.getUI());
		HtmlUtil.hide(this.endController.getUI());
	}

	this.finishLine = function(){
		//���߻��ϼ�ͷ�����Ͽ��Ƶ�
		HtmlUtil.append(ui,arrow);
		this.beginController = new LineController(container,this,5,5);
		this.endController = new LineController(container,this,5,5);
		HtmlUtil.append(ui,this.beginController.getUI());
		HtmlUtil.append(ui,this.endController.getUI());
		this.setControllerPosition();

	}
	//begin��endcontroller ����
	this.setControllerPosition = function(){
		if(!this.beginController || !this.endController){
			return;
		}
		var direction = Line._getDirection(this.fromPos,this.toPos);
		switch(direction){
			case Constants.DIRECTION_LT:
				HtmlUtil.setLeft(this.endController.getUI(),0+"px");
				HtmlUtil.setTop(this.endController.getUI(),0+"px");

				HtmlUtil.setLeft(this.beginController.getUI(),Math.abs(this.fromPos.x-this.toPos.x)+"px");
				HtmlUtil.setTop(this.beginController.getUI(),Math.abs(this.fromPos.y-this.toPos.y)+"px");
				break;
			case Constants.DIRECTION_RT:
				HtmlUtil.setLeft(this.beginController.getUI(),0+"px");
				HtmlUtil.setTop(this.beginController.getUI(),Math.abs(this.fromPos.y-this.toPos.y)+"px");

				HtmlUtil.setLeft(this.endController.getUI(),Math.abs(this.fromPos.x-this.toPos.x)+"px");
				HtmlUtil.setTop(this.endController.getUI(),0+"px");
				break;
			case Constants.DIRECTION_LB:
				HtmlUtil.setLeft(this.endController.getUI(),0+"px");
				HtmlUtil.setTop(this.endController.getUI(),Math.abs(this.fromPos.y-this.toPos.y)+"px");

				HtmlUtil.setLeft(this.beginController.getUI(),Math.abs(this.fromPos.x-this.toPos.x)+"px");
				HtmlUtil.setTop(this.beginController.getUI(),0+"px");
				break;
			case Constants.DIRECTION_RB:
				HtmlUtil.setLeft(this.beginController.getUI(),0+"px");
				HtmlUtil.setTop(this.beginController.getUI(),0+"px");

				HtmlUtil.setLeft(this.endController.getUI(),Math.abs(this.fromPos.x-this.toPos.x)+"px");
				HtmlUtil.setTop(this.endController.getUI(),Math.abs(this.fromPos.y-this.toPos.y)+"px");
				break;
		}

	}
	// ɾ��UI ÿ��component������ node line polyline
	this.removeUI = function(){
		HtmlUtil.remove(this.getUI());
	}

	new LineListener(this);

}

Line._getDirection = function(beginPos,endPos){
	if(endPos.x>=beginPos.x && endPos.y<=beginPos.y){
		return Constants.DIRECTION_RT;
	}
	if(endPos.x>=beginPos.x && endPos.y>=beginPos.y){
		return Constants.DIRECTION_RB;
	}
	if(endPos.x<beginPos.x && endPos.y<beginPos.y){
		return Constants.DIRECTION_LT;
	}
	if(endPos.x<beginPos.x && endPos.y>beginPos.y){
		return Constants.DIRECTION_LB;
	}
}

function LineController(container,line,w,h){
	this.line = line;
	this.w = w;
	this.h= h;
	this.container = container;

	var ui =  HtmlUtil.newElement('<div onselectstart="javascript:return false;" class="rect-zone" style="position:absolute;z-index:12;display:none;"></div>');
	HtmlUtil.setWidth(ui,this.w);
	HtmlUtil.setHeight(ui,this.h);
	
	this.getUI = function(){
		return ui;
	}

	this.getPosition = function(){
		return HtmlUtil.getCoords(this.getUI());
	}

	
}


function LineListener(line){
    var onClick = function(e){
		//��container������ѡ�е�ȡ��ѡ��
		line.container.unSelectAll();
		line.container.currentSelectedComponent = line;
		line.showController();
	} 

	$(line.getUI()).bind('click',onClick);
}




