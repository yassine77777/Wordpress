<?php

/**
 * User Roles Profile Edit Part
 *
 * @package bbPress
 * @subpackage Theme
 */

?>

<div>
	<label for="role"><?php esc_attr_e( 'Blog Role', 'bbpress' ) ?></label>

	<?php bbp_edit_user_blog_role(); ?>

</div>

<div>
	<label for="forum-role"><?php esc_attr_e( 'Forum Role', 'bbpress' ) ?></label>

	<?php bbp_edit_user_forums_role(); ?>

</div>
