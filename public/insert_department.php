<?php
include 'db.php';

$name = $_POST['name'];
$desc = $_POST['description'];
$manager_id = $_POST['manager_id'] ?: "NULL";
$budget = $_POST['budget'];
$status = $_POST['status'];

$sql = "INSERT INTO departments (name, description, manager_id, budget, status) 
        VALUES ('$name', '$desc', $manager_id, $budget, '$status')";

echo $conn->query($sql) ? "Success" : "Error: " . $conn->error;
$conn->close();
?>
