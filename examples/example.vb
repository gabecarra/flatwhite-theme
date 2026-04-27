' Flatwhite theme preview — Visual Basic

Imports System
Imports System.Collections.Generic
Imports System.Linq

Public Class Matrix
    Private ReadOnly _data As Double(,)
    Private ReadOnly _rows As Integer
    Private ReadOnly _cols As Integer

    Public Sub New(rows As Integer, cols As Integer)
        _rows = rows
        _cols = cols
        _data = New Double(rows - 1, cols - 1) {}
    End Sub

    Public ReadOnly Property Rows As Integer
        Get
            Return _rows
        End Get
    End Property

    Public ReadOnly Property Cols As Integer
        Get
            Return _cols
        End Get
    End Property

    Default Public Property Item(row As Integer, col As Integer) As Double
        Get
            Return _data(row, col)
        End Get
        Set(value As Double)
            _data(row, col) = value
        End Set
    End Property

    Public Function Multiply(other As Matrix) As Matrix
        If Me._cols <> other._rows Then
            Throw New InvalidOperationException("Incompatible matrix dimensions")
        End If

        Dim result As New Matrix(_rows, other._cols)
        For i As Integer = 0 To _rows - 1
            For j As Integer = 0 To other._cols - 1
                Dim sum As Double = 0.0
                For k As Integer = 0 To _cols - 1
                    sum += Me(i, k) * other(k, j)
                Next
                result(i, j) = sum
            Next
        Next
        Return result
    End Function

    Public Function Transpose() As Matrix
        Dim result As New Matrix(_cols, _rows)
        For i As Integer = 0 To _rows - 1
            For j As Integer = 0 To _cols - 1
                result(j, i) = Me(i, j)
            Next
        Next
        Return result
    End Function

    Public Overrides Function ToString() As String
        Dim sb As New System.Text.StringBuilder()
        For i As Integer = 0 To _rows - 1
            Dim row As New List(Of String)
            For j As Integer = 0 To _cols - 1
                row.Add(Me(i, j).ToString("F2"))
            Next
            sb.AppendLine(String.Join("  ", row))
        Next
        Return sb.ToString()
    End Function
End Class

Module Demo
    Sub Main()
        Dim a As New Matrix(2, 3)
        a(0, 0) = 1 : a(0, 1) = 2 : a(0, 2) = 3
        a(1, 0) = 4 : a(1, 1) = 5 : a(1, 2) = 6

        Dim b As New Matrix(3, 2)
        b(0, 0) = 7  : b(0, 1) = 8
        b(1, 0) = 9  : b(1, 1) = 10
        b(2, 0) = 11 : b(2, 1) = 12

        Dim c As Matrix = a.Multiply(b)
        Console.WriteLine("A * B =")
        Console.Write(c.ToString())

        Dim t As Matrix = a.Transpose()
        Console.WriteLine("A^T =")
        Console.Write(t.ToString())
    End Sub
End Module
