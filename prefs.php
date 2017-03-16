<?php
include('lib/db.php');
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
$css = array('preferences.css');
include('common/header.php');
?>

    
    <div class="container sections-wrapper">
        <div class="row">
            <div class="col-md-8 col-sm-12 card" id='preferences'>

                <!-- todo change name -->

                <a id='home-link' href='home.php'><i class="fa fa-arrow-left"></i> Back to home</a>
                <h2>Change Password</h2>

                <form id='prefs-form' action='ajax/change-password.php' method='POST'>
                    <div class='form-group float-label'>
                        <label for='current-password'>Current Password</label>
                        <span class="error-message"></span>
                        <input type='password' id='current-password' name='current-password' class='form-control'/>
                    </div>
                    <div class='form-group float-label'>
                        <label for='new-password'>New Password </label>
                        <span class="error-message"></span>
                        <input type='password' id='new-password' name='new-password' class='form-control'/>
                    </div>
                    <button type="submit" id='submit-button' class="btn btn-success">Change Password</button>
                </form>

                <p id='msg'></p>
                
            </div>
        </div>
    </div>
    
    <?php
    $scripts = array('prefs.js');
    include('common/footer.php');
    ?>
 