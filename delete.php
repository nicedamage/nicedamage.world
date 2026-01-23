<?php
$data = json_decode(file_get_contents("messages.json"), true);

$id = $_POST["id"];
$token = $_POST["token"];

$data = array_values(array_filter($data, function($m) use ($id, $token) {
  if ($m["id"] === $id) {
    return $m["token"] !== $token;
  }
  return true;
}));

file_put_contents("messages.json", json_encode($data, JSON_PRETTY_PRINT));
