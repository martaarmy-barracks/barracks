<?php
// Enforce HTTPS unless config says otherwise.
if ((!isset($_SERVER["HTTPS"]) || $_SERVER["HTTPS"] != "on")
    && (!isset($DISABLE_HTTPS) || !$DISABLE_HTTPS))
{
    // Tell the browser to redirect to the HTTPS URL.
    header("Location: https://" . $_SERVER["HTTP_HOST"] . $_SERVER["REQUEST_URI"], true, 301);
    // Prevent the rest of the script from executing.
    exit;
}
?>
