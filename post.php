<?php
$data = json_decode(file_get_contents("messages.json"), true);

$new = [
  "id" => uniqid(),
  "user" => $_POST["user"] ?: "anonymous",
  "text" => $_POST["text"],
  "time" => time(),
  "token" => $_POST["token"]
];

array_unshift($data, $new);
file_put_contents("messages.json", json_encode($data, JSON_PRETTY_PRINT));
