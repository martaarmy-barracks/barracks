<?php
if(!isset($_GET['task'])) {
    header('location: index.php');
    exit();
}

$taskcode = $_GET['task'];

include('lib/db.php');
init_db();

$result = getOpAndTaskAndUserByTaskCode($taskcode);
if(is_null($result)) {
    header('location: index.php');
    exit();
}

$userid = $result['userid'];
$op = $result['op'];
$task = $op['single_task'];

if($task['completed']==1) {
    header('location: index.php');
    exit();
}

$sid = createNewSessionByUserid($userid);
if(is_null($sid)) {
    header('location: index.php');
    exit();
}

setcookie('sid', $sid, time() + 365*24*60*60);

$user = getSessionUser($sid);

if(is_null($user)) {
    setcookie('sid', '', time() - 3600);
    header('Location: index.php');
    exit();
}

$css = array('home.css', 'task-completed.css');

include('common/header.php');
include('lib/op-with-tasks-view.php');
?>

    
    <div class="container sections-wrapper"><div class="row"><div class="col-md-6 col-md-offset-3 col-sm-12">

    <h2>Problem Reported!</h2>
    <p>The problem completing this task has been reported. <br/><br/>
    You can tell us more about the problem right here: </p>

    <textarea></textarea>
    <button type="submit" class="btn btn-success">Send Details</button>
        
    <div class='card' id='complete-task-modal' style='padding:0'>
                
        <div class='modal-header'>
            <h4 class='modal-title'><?php echo $op['name']; ?></h4>
            <!-- todo: show op details here -->
        </div>
        <div class='modal-body'>
            <p class='modalmsg success'></p>
            <span class='data-taskid'><?php echo $task['id']; ?></span>
            <ul class='fa-ul task-container' id='task-container'>
                <?php echo renderTask($task); ?>
            </ul>
        </div>
        <!-- todo if you can't complete coz you don't have sign, just click here. -->
    </div>

    </div></div></div>
    
    <?php
    $scripts = array('main.js', 'task-problem.js');
    include('common/footer.php');
    ?>
 

