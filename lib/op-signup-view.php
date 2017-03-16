<?php

function renderOpSignupCard($op) {
	$opid = $op['id'];
    $opname = $op['name'];
    $opdesc = $op['description'];
    $opdetail = $op['detail'];
    $opdata = $op['data'];
    $opdataform = '';

    $opdetailclass='nodetail';
    $opcalltoaction = "<button class='btn btn-join btn-primary'>Join Now!</button><br style='clear:both'/>";

    if(!is_null($opdetail)) {
        $opdetailclass = '';
        $opcalltoaction = "<button class='btn btn-join btn-primary'>Read More...</button><span class='cancel-link'>Cancel</span><br style='clear:both'/>";
        $opdataform = '';

        if(!is_null($opdata)) {
            $opdataform = "<div class='op-data-form'><p class='form-title'>Fill this short form to join this Operation.</p>";

            foreach($opdata as $opfield) {
                $opdataform = $opdataform . renderOpField($opfield);
            }

            $opdataform = $opdataform . "</div>";

            $opcalltoaction = $opcalltoaction . "";
        }
    } else {
        $opdetail = '';
    }

    

    echo <<<OPERATION
                    <div class="card">
                        <div class='operation $opdetailclass' data-value='$opid'>
                            <h3 class='operation-title'>$opname</h3>
                            <p class="operation-description">$opdesc</p>
                            <div class="operation-detail">$opdetail</div>
                            $opdataform
                            $opcalltoaction</button>
                        </div>
                    </div>
OPERATION;
}

function renderOpField($opfield) {
	$opfieldtitle = $opfield->title;
    $opfieldid = $opfield->id;
    $opfieldtype = $opfield->type;

    switch ($opfieldtype) {
    	case 'list':
    		return <<<OPFIELD
                <div class='form-group float-label' data-type='list' id='$opfieldid'>
                    <label>$opfieldtitle</label>
                    <span class="error-message"></span>
                    <table cellpadding=0 cellspacing=0 width=100%><tr>
						<td class='input-region'>
							<div class='input-wrapper'><input type='text' class='form-control'/><i class="ionicons ion-android-delete delete-button"></i></div>
							<div class="plus-btn"><i class="fa fa-plus"></i></div>
						</td>
						<td class='plus-button-region'></td>
					</tr></table>
                </div>
OPFIELD;
    	case 'text':
    		return <<<OPFIELD
				<div class='form-group float-label' id='$opfieldid'>
                    <label>$opfieldtitle</label>
                    <span class="error-message"></span>
                    <input type='text' class='form-control'/>
                </div>
OPFIELD;
    }
	
}

?>
