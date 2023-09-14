<?php
/**
 * Plugin Name: DD Hide Admin Bar
 * Plugin URI: https://diaboliquedesign.com
 * Description:  Hide the admin bar.
 * Version: 1.0
 * Author: Diabolique Design
 * Author URI: https://diaboliquedesign.com
 * Text Domain: dd-hide-admin-bar
**/ 

add_filter( 'show_admin_bar', '__return_false' );
