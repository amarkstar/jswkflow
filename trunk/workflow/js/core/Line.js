function Line(){
	var ui = HtmlUtil.newElement('<v:line style="position:absolute;z-index:11"></v:line>');

	var arrow = HtmlUtil.newElement('<v:Stroke dashstyle="solid" endarrow="classic"/>');

	this.getUI = function(){
		return ui;
	}
	//�߷����ˣ�begin�˺�end�ˣ��������������������¼�ߵ��������ڸ��Ե�node�ϵ�ƫ���������ڵ�node��קʱ���¶����ߵ�λ��
	this.beginPosOffset;
	this.endPosOffset;

	this.setFrom = function(x,y){
		this.getUI().from = x + ',' + y;
	}

	this.setTo = function(x,y){
		this.getUI().to = x + ',' + y;
	}

	this.setArrow = function(){
		HtmlUtil.append(ui,arrow);
	}

}

