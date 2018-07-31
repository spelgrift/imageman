<?php
class Blog extends Controller {
	function __construct() {
		parent::__construct();
		if(!BLOG_ENABLED){
			$this->error();
			return;
		}
		// Instantiate content model
		$this->loadModel('content', false);
		$this->contentModel = new Content_Model();
	}

	public $posts_at_a_time = 3;

	public function index()
	{
		if(!BLOG_ENABLED){return;}

		$this->view->pageTitle = BRAND." - Blog";
		// Admin nav - manage blog
		$this->view->adminNav = 'blogindex';
		// JS - public
		$this->view->js = array('public.min.js');
		// Get post list and attributes from DB
		$this->view->posts = $this->model->getPosts(false, $this->posts_at_a_time);
		// Add content to the array
		$this->_loadTypeContentModel('blog');
		$this->view->posts = $this->blogContentModel->getPostContent($this->view->posts);
		// Render
		$this->view->render('blog/index');
	}

	public function loadMorePosts($lastID)
	{
		if(!BLOG_ENABLED){return;}

		// Get post list and attributes from DB
		$this->view->posts = $this->model->getPosts(false, $this->posts_at_a_time, $lastID);
		// Add content to the array
		$this->_loadTypeContentModel('blog');
		$this->view->posts = $this->blogContentModel->getPostContent($this->view->posts);
		// Render
		$this->view->render('blog/loadPosts', false);

	}

	public function post($url = false)
	{
		if(!BLOG_ENABLED){return;}

		if(!$url) { 
			$this->error();
			return false;
		}
		// Get post attr
		if(!$this->view->postAttr = $this->model->getPost($url)){
			$this->error();
			return false;
		}
		// Get post content
		$this->view->postContent = $this->contentModel->getPageContent($this->view->postAttr['postID'], 'post');
		// Admin nav - edit post
		$this->view->adminNav = 'post';
		//Page title
		$this->view->pageTitle = $this->view->postAttr['title']." | ".BRAND;

		// JS - public
		$this->view->js = array('public.min.js');
		$this->view->render('blog/post');
	}

	public function manage()
	{
		if(!BLOG_ENABLED){return;}
		Auth::setAccess();
		$this->view->pageTitle = "Manage Blog";
		$this->view->adminNav = 'manageblog';
		// JS - blogadmin
		$this->view->js = array('manageBlog.min.js');
		// Get post list and attributes from DB
		$this->view->posts = $this->model->getPosts(true);
		// Render
		$this->view->render('blog/manage');
	}

	public function newpost() {
		if(!BLOG_ENABLED){return;}
		Auth::setAccess();
		$this->view->newPost = true;
		// Make new post in DB and get initial attributes
		$this->view->postAttr = $this->model->newPost();
		$this->view->postContent = array();
		// Templates
		$this->view->templates = $this->contentModel->buildTemplates();
		// Gallery and Video list for embedding
		$this->view->galleryArray = $this->contentModel->listContent('gallery');
		$this->view->videoArray = $this->contentModel->listContent('video');
		// Page Title
		$this->view->pageTitle = "New Post";
		// Admin nav
		$this->view->adminNav = 'editpost';
		// JS - blogadmin
		$this->view->js = array('editPost.min.js');
		// Render
		$this->view->render('blog/editpost');
	}

	public function editpost($url = false) {
		if(!BLOG_ENABLED){return;}
		Auth::setAccess();
		if(!$url) { 
			$this->error();
			return false;
		}
		// Get post attr
		if(!$this->view->postAttr = $this->model->getPost($url, true)){
			$this->error();
			return false;
		}
		// Get post content
		$this->view->postContent = $this->contentModel->getPageContent($this->view->postAttr['postID'], 'post');
		// Templates
		$this->view->templates = $this->contentModel->buildTemplates();
		// Gallery and Video list for embedding
		$this->view->galleryArray = $this->contentModel->listContent('gallery');
		$this->view->videoArray = $this->contentModel->listContent('video');
		// Set existing post flag
		$this->view->newPost = false;
		// Admin nav - edit post
		$this->view->adminNav = 'editpost';
		//Page title
		$this->view->pageTitle = $this->view->postAttr['title']." | ".BRAND;
		// JS - blogadmin
		$this->view->js = array('editPost.min.js');
		$this->view->render('blog/editpost');
	}

	public function publishPost($contentID) {
		if(!BLOG_ENABLED){return;}
		Auth::setAccess();
		$this->_loadTypeContentModel('blog');
		$this->blogContentModel->publishPost($contentID);
	}

	public function togglePublic($contentID) {
		if(!BLOG_ENABLED){return;}
		Auth::setAccess();
		$this->model->togglePublic($contentID);
	}

/**
 *
 *	POST CONTENT METHODS
 *
 */
	public function addSpacer($postID)
	{
		if(!BLOG_ENABLED){return;}
		Auth::setAccess();
		$this->_loadTypeContentModel('page');
		$this->pageContentModel->addSpacer($postID, 'post');
	}

	public function addSingleImage($postID)
	{
		if(!BLOG_ENABLED){return;}
		Auth::setAccess();
		$this->_loadTypeContentModel('blog');
		$filename = $this->blogContentModel->makeBlogImgName($postID);
		$this->_loadTypeContentModel('image');
		$this->imageContentModel->addSingleImage($postID, $filename, 'post');
	}

	public function addText($postID)
	{
		if(!BLOG_ENABLED){return;}
		Auth::setAccess();
		$this->_loadTypeContentModel('text');
		$this->textContentModel->addText($postID, 'post');
	}

	public function addNewEV($postID)
	{
		if(!BLOG_ENABLED){return;}
		Auth::setAccess();
		$this->_loadTypeContentModel('video');
		$this->videoContentModel->addVideo($postID, false, true, 'post');
	}

	public function addEmbedVideo($videoID, $postID)
	{
		if(!BLOG_ENABLED){return;}
		Auth::setAccess();
		$this->_loadTypeContentModel('video');
		if($result = $this->videoContentModel->addEmbedVideo($postID, $videoID, 'post')) {
			echo json_encode($result);
		}
	}

	public function addSSgallery($postID)
	{
		if(!BLOG_ENABLED){return;}
		Auth::setAccess();
		$this->_loadTypeContentModel('gallery');
		$this->galleryContentModel->addGallery($postID, false, true, 'post');
	}

	public function addSlideshow($galID, $postID)
	{
		if(!BLOG_ENABLED){return;}
		Auth::setAccess();
		$this->_loadTypeContentModel('gallery');
		if($result = $this->galleryContentModel->addSlideshow($postID, $galID, 'post')){
			echo json_encode($result);
		}
	}




}