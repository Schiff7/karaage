(defsystem "karaage-test"
  :defsystem-depends-on ("prove-asdf")
  :author "Hu"
  :license ""
  :depends-on ("karaage"
               "prove")
  :components ((:module "tests"
                :components
                ((:test-file "karaage"))))
  :description "Test system for karaage"
  :perform (test-op (op c) (symbol-call :prove-asdf :run-test-system c)))
