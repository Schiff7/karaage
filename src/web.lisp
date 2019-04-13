(in-package :cl-user)
(defpackage karaage.web
  (:use :cl
        :caveman2
        :karaage.config
        :karaage.view
        :karaage.db
        :datafly
        :sxql)
  (:export :*web*))
(in-package :karaage.web)

;; for @route annotation
(syntax:use-syntax :annot)

;;
;; Application

(defclass <web> (<app>) ())
(defvar *web* (make-instance '<web>))
(clear-routing-rules *web*)

;;
;; Routing rules

(defroute "/" ()
  (render #P"index.html"))

;; Retrieve all posts
(defroute ("/api/posts" :method :GET) ()
  (render-json 
    (with-connection (db)
      (retrieve-all
        (select :*
          (from :hu.post))))))

(defroute ("/api/tags" :method :GET) ()
  (render-json
    (with-connection (db)
      (retrieve-all
        (select :*
          (from :hu.tag))))))

(defroute ("/api/categories" :method :GET) ()
  (render-json
    (with-connection (db)
      (retrieve-all
        (select :*
          (from :hu.category))))))

;; Error pages
;; Redirect to 

(defmethod on-exception ((app <web>) (code (eql 404)))
  (declare (ignore app))
  (merge-pathnames #P"_errors/404.html"
                   *template-directory*))
