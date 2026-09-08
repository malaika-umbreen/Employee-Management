<?php
include 'db.php';

$employee_id = $_POST['employee_id'];
$date = $_POST['date'];
$check_in = $_POST['check_in'];
$check_out = $_POST['check_out'];
$break = $_POST['break_duration'];
$total = $_POST['total_hours'];
$status = $_POST['status'];
$notes = $_POST['notes'];

$sql = "INSERT INTO attendance 
(employee_id, date, check_in, check_out, break_duration, total_hours, status, notes) 
VALUES ($employee_id, '$date', '$check_in', '$check_out', $break, $total, '$status', '$notes')";

echo $conn->query($sql) ? "Success" : "Error: " . $conn->error;
$conn->close();
?>
