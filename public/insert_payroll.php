<?php
include 'db.php';

$sql = "INSERT INTO payroll 
(employee_id, pay_period_start, pay_period_end, basic_salary, overtime_hours, overtime_rate, 
overtime_amount, bonus, deductions, tax_deduction, net_salary, status, processed_by)
VALUES (
    {$_POST['employee_id']}, '{$_POST['pay_period_start']}', '{$_POST['pay_period_end']}', 
    {$_POST['basic_salary']}, {$_POST['overtime_hours']}, {$_POST['overtime_rate']},
    {$_POST['overtime_amount']}, {$_POST['bonus']}, {$_POST['deductions']}, 
    {$_POST['tax_deduction']}, {$_POST['net_salary']}, '{$_POST['status']}', 
    {$_POST['processed_by'] ?: "NULL"})";

echo $conn->query($sql) ? "Success" : "Error: " . $conn->error;
$conn->close();
?>
