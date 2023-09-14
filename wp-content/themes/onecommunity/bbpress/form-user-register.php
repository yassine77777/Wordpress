<?php

/**
 * User Registration Form
 *
 * @package bbPress
 * @subpackage Theme
 */

?>

<form method="post" action="<?php bbp_wp_login_action( array( 'context' => 'login_post' ) ); ?>" class="bbp-login-form">
	<fieldset class="bbp-form">
		<legend><?php esc_attr_e( 'Create an Account', 'bbpress' ); ?></legend>

		<div class="bbp-template-notice">
			<p><?php esc_attr_e( 'Your username must be unique, and cannot be changed later.', 'bbpress' ) ?></p>
			<p><?php esc_attr_e( 'We use your email address to email you a secure password and verify your account.', 'bbpress' ) ?></p>

		</div>

		<div class="bbp-username">
			<label for="user_login"><?php esc_attr_e( 'Username', 'bbpress' ); ?>: </label>
			<input type="text" name="user_login" value="<?php bbp_sanitize_val( 'user_login' ); ?>" size="20" id="user_login" tabindex="<?php bbp_tab_index(); ?>" />
		</div>

		<div class="bbp-email">
			<label for="user_email"><?php esc_attr_e( 'Email', 'bbpress' ); ?>: </label>
			<input type="text" name="user_email" value="<?php bbp_sanitize_val( 'user_email' ); ?>" size="20" id="user_email" tabindex="<?php bbp_tab_index(); ?>" />
		</div>

		<?php do_action( 'register_form' ); ?>

		<div class="bbp-submit-wrapper">

			<button type="submit" tabindex="<?php bbp_tab_index(); ?>" name="user-submit" class="button submit user-submit"><?php esc_attr_e( 'Register', 'bbpress' ); ?></button>

			<?php bbp_user_register_fields(); ?>

		</div>
	</fieldset>
</form>
