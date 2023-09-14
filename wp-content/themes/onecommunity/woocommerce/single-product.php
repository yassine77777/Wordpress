<?php
/**
 * The Template for displaying all single products
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/single-product.php.
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see 	    https://docs.woocommerce.com/document/template-structure/
 * @author 		WooThemes
 * @package 	WooCommerce/Templates
 * @version     1.6.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

get_header( 'shop' ); ?>

<section class="wrapper">

<main id="content">

	<?php
		/**
		 * woocommerce_before_main_content hook.
		 *
		 * @hooked woocommerce_output_content_wrapper - 10 (outputs opening divs for the content)
		 * @hooked woocommerce_breadcrumb - 20
		 */
		do_action( 'woocommerce_before_main_content' );
	?>

		<?php while ( have_posts() ) : the_post(); ?>

			<?php wc_get_template_part( 'content', 'single-product' ); ?>

		<?php endwhile; // end of the loop. ?>

	<?php
		/**
		 * woocommerce_after_main_content hook.
		 *
		 * @hooked woocommerce_output_content_wrapper_end - 10 (outputs closing divs for the content)
		 */
		do_action( 'woocommerce_after_main_content' );
	?>

	</main><!-- content -->

<aside id="sidebar" class="sidebar">
	<?php 
	$transient = get_transient( 'onecommunity_sidebar_shop' );
	if ( false === $transient || !get_theme_mod( 'onecommunity_transient_sidebar_shop_enable', 0 ) == 1 ) {
	ob_start();

	if (function_exists('dynamic_sidebar') && dynamic_sidebar('sidebar-shop')) : endif;

	$sidebar = ob_get_clean();
	print_r( $sidebar );
	
	if ( get_theme_mod( 'onecommunity_transient_sidebar_shop_enable', 0 ) == 1 ) {
		set_transient( 'onecommunity_sidebar_shop', $sidebar, MINUTE_IN_SECONDS * get_theme_mod( 'onecommunity_transient_sidebar_shop_expiration', 4320 ) );
	}

	} else {
		echo '<!-- Transient onecommunity_sidebar_shop ('.get_theme_mod( 'onecommunity_transient_sidebar_shop_expiration', 4320 ).' min) -->';
		print_r( $transient );
	}
	?>
</aside><!--sidebar ends-->

	<div id="sidebar-spacer"></div>

</section><!-- .wrapper -->

<?php get_footer( 'shop' );

/* Omit closing PHP tag at the end of PHP files to avoid "headers already sent" issues. */
