<?php


function renderOpWithTasks($op) {
	
	$rendered = '';

    $opid = $op['id'];
    $opname = $op['name'];
    $opdesc = $op['description'];
    
    $rendered = <<<OPERATION_START
                    <div class="card">
                        <div class='operation' data-opid='$opid'>
                            <h3 class='operation-title'>$opname</h3>
                            <p class="operation-description">$opdesc</p>
OPERATION_START;

        if(!is_null($op['data'])) {
            $part_data = $op['participant_data'];
            foreach($op['data'] as $opfield) {
                $opfieldid = $opfield->id;
                $opfieldtype = $opfield->type;
                $opfieldmsg = $opfield->message;
                $fieldval = $part_data->$opfieldid;
                
                switch ($opfieldtype) {
                    case 'text':
                        $rendered .= <<<PART_DATA
                            <div class='participant-data'>
                                <span class='participant-data-field'>$opfieldmsg</span>
                                <span class='participant-data-value'>$fieldval</span>
                            </div>
PART_DATA;
                        break;
                    
                    case 'list':
                        $rendered .= <<<PART_DATA1
                            <div class='participant-data'>
                                <span class='participant-data-field'>$opfieldmsg</span>
                                <ul class='participant-data-value-list'>
PART_DATA1;
                        foreach($fieldval as $val) {
                            if(!is_string($val)) {
                                $val = $val->val;
                            }
                            $rendered .= "<li>$val</li>";
                        }
                        $rendered .= <<<PART_DATA2
                                </ul>
                            </div>
PART_DATA2;
                        break;
                }
                
            }
        }

        if(count($op['tasks'])==0) {
            $rendered .= "<span class='tasks-title notasks'>No tasks in this operation yet.</span>";
        } else {
            $rendered .= " <ul class='fa-ul'>";

            foreach($op['tasks'] as $task) {
                $rendered .= renderTask($task);
            }

            $rendered .= " </ul>";
        }


        $rendered .= <<<OPERATION_END
                        </div>
                    </div>
OPERATION_END;

	return $rendered;
}

function renderTask($task) {
    $_now = new DateTime();
    
    $taskid = $task['id'];
    $tasktitle = $task['title'];
    $taskdescription = $task['description'];
    $taskdeadline = $task['deadline'];
    $taskcompleted = $task['completed'];
    $taskdeadlinestr = $taskdeadline->format('j-M-Y');
    
    $tasklateicon = 'fa-square-o';
    $taskdeadline_phrase = '';
    $statusclass = '';

    if(is_null($taskdescription)) {
        $taskdescription = '';
    } else {
        $taskdescription = "<p class='task-description'>" . $taskdescription . "</p>";
    }
    
    if($taskcompleted==1) {
        $statusclass = 'completed';
        $tasklateicon = 'fa-check-square-o';
    } else if($taskdeadline < $_now) {
        $tasklateicon = 'fa-exclamation-circle';
        $taskdeadline_phrase = 'was';
        $statusclass = 'late';
    }

    return <<<TASK
                    <li data-taskid='$taskid' class='operation-task $statusclass'><i class="fa fa-li $tasklateicon"></i>
                        <p class='task-title'>$tasktitle</p>
                        $taskdescription
                        <span class='due-date'>$taskdeadline_phrase due $taskdeadlinestr</span>
                    </li>
TASK;
}

?>