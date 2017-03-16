<?php
include('lib/db.php');
include('lib/op-with-tasks-view.php');
include('lib/op-signup-view.php');

init_db();

if(!isset($_COOKIE["sid"])) {
    header('Location: index.php');
    exit();
}

$sid = $_COOKIE["sid"];
$user = getSessionUser($sid);

if(is_null($user)) {
    setcookie('sid', '', time() - 3600);
    header('Location: index.php');
    exit();
}

$css = array('home.css');

include('common/header.php');
?>

    
    <div class="container sections-wrapper">
        <div class="row">
            <div class="col-md-4 col-sm-12">
                <section class="section" id='participating-operations'>

                    <h2 class="heading">My Operations</h2>
<?php
$ops = getParticipatingOperationsAndTasks($user['id']);

if(count($ops)>0) { 
    echo <<<OPS_INTRO
                    <div class="description">
                        <p>Operations you're participating.</p>
                        <ul>
                            <li>Click a task in an operation to complete it.</li>
                            <li>Completing a task before its deadline gets you get 20 points!</li>
                            <li>Completing a task after its deadline gets you only 10 points.</li>
                            
                        </ul>
                    </div>
OPS_INTRO;

    foreach($ops as $op) {

        $op_html = renderOpWithTasks($op);
        echo $op_html;

    }

} else {
    echo <<<NO_OPS_MSG
                    <div class="card">
                        <p>You have not joined any operations. Go ahead and join one!</p>
                    </div>
NO_OPS_MSG;
}
?>                    
                                            
                </section><!--//section-->
            </div>

            <div class="col-md-4 col-sm-12">    
               <section class="section">
                    <h2 class="heading">All Operations</h2>

<?php
$ops = getNonParticipatingOperations($user['id']);

if(count($ops) == 0 ) {
    echo <<<NOMORE
        <div class="card">
            <p>You are volunteering in all our operations currently, so no others to see!<br/><br/>When we launch more operations, they will show up here.</p>
        </div>
NOMORE;

} else {
    echo '<p class="description">Other MARTA Army Operations you can join and start volunteering. Joining an operation gives you +5 points!</p>';
    foreach($ops as $op) {
        echo renderOpSignupCard($op);
    }
}
?>
                </section>
            </div>

            <div class="col-md-4 col-sm-12"> 
                <section class="section">
                    <h2 class="heading">Other ways you can help</h2>
                    <p class="description">There are more ways to help, and every little counts.</p>
                    <!-- todo: make these sections work -->
                    <div class="card">
                        <h3>Spread the news</h3>
                        <p>Share the news. Tell your co-workers, your friends, and everyone else. Share on your social networks. Help other transit enthusiasts discover us so they can volunteer too.</p>
                        <button class='btn btn-primary'>Spread the news</button>
                    </div>

                    <div class="card">
                        <h3>Donate to the MARTA Army</h3>
                        <p>We are a completely crowd-funded organization, and your generous donations help us improve our public transit every day.</p>
                        <button class='btn btn-primary'>Donate</button>
                    </div>

                </section>
            </div>

        </div> <!--//row-->
    </div><!--//container-->

    <div class='modal fade' id='complete-task-modal'>
        <div class="modal-dialog">
            <div class='modal-content'>
                <div class='modal-header'>
                    <h4 class='modal-title operation-title'></h4>
                    <p class='modal-subtitle'>Complete a task</p>
                </div>
                <div class='modal-body'>
                    <p class='modalmsg success'></p>
                    <span class='data-taskid'></span>
                    <ul class='fa-ul task-container'><li class='operation-task'></li></ul>
                </div>
                <div class='modal-footer'>
                    <span class='cancel-complete' data-dismiss='modal'>Cancel</span>
                    <button type='button' class='btn btn-primary complete-task'>Mark Completed</button>
                </div>
            </div>
        </div>
    </div>
    
    <?php
    $scripts = array('main.js', 'home.js');
    include('common/footer.php');
    ?>
 

