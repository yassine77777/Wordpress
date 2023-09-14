<?php
/*
Template Name: No Sidebar Page
*/
get_header(); ?>

<?php
global $wp_query;
while ( have_posts() ) : the_post(); ?>

<section class="wrapper">

<main id="content">

	<div class="breadcrumbs">
	<a href="<?php echo home_url(); ?>"><?php esc_attr_e('Home', 'onecommunity'); ?></a> / <span class="current"><?php the_title(); ?></span>
	</div>

	<h1 class="page-title"><?php
		$thetitle = get_the_title();
		$getlength = strlen($thetitle);
		$thelength = 35;
		echo substr($thetitle, 0, $thelength);
		if ($getlength > $thelength) echo "...";
	?></h1>
	<?php

			// Include the page content template.
			get_template_part( 'template-parts/content', 'page' );

			wp_reset_query();

			// If comments are open or we have at least one comment, load up the comment template.
			if ( comments_open() || get_comments_number() ) {
				comments_template();
			}

			// End of the loop.
		endwhile;

		?>

</main><!-- .content -->

</section><!-- .wrapper -->
<?php get_footer(); ?>
