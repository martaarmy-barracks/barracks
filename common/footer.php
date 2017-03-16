<!-- ******FOOTER****** --> 
    <footer class="footer">
        <div class="container text-center">
            <p>Contact Us</p>
            <div>
                <a class="fa-stack fa-lg" target='_blank' href="https://www.facebook.com/martaarmy">
                    <i class="fa fa-circle fa-stack-2x"></i>
                    <i class="fa media-icon fa-facebook fa-stack-1x"></i>
                </a>
                <a class="fa-stack fa-lg" target='_blank' href='https://twitter.com/MARTAarmy'>
                    <i class="fa fa-circle fa-stack-2x"></i>
                    <i class="fa media-icon fa-twitter fa-stack-1x"></i>
                </a>
                <a class="fa-stack fa-lg" target='_blank' href='https://instagram.com/martaarmy/'>
                    <i class="fa fa-circle fa-stack-2x"></i>
                    <i class="fa media-icon fa-instagram fa-stack-1x"></i>
                </a>
                <a class="fa-stack fa-lg" target='_blank' href='mailto:themartaarmy@gmail.com'>
                    <i class="fa fa-circle fa-stack-2x"></i>
                    <i class="fa media-icon fa-envelope fa-stack-1x"></i>
                </a>
            </div>

        </div><!--//container-->
    </footer><!--//footer-->
    
    <!-- Javascript -->          
    <script type="text/javascript" src="jslib/jquery-2.1.4.min.js"></script>
    <script type="text/javascript" src="jslib/bootstrap/js/bootstrap.min.js"></script>   
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/json2/20150503/json2.min.js"></script>
    <script type="text/javascript" src="jslib/js.cookie.js"></script>
    <script type="text/javascript" src="js/float-label.js"></script>
    
    <!-- custom js -->
    <?php
    foreach($scripts as $js) {
        echo "<script type='text/javascript' src='js/$js'></script>";
    }
    ?>
    
</body>
</html> 