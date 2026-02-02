import {test} from 'node:test';
import assert from 'node:assert';
import {convertToCSV} from './csv';

test('convertToCSV should convert an array of objects to CSV', () => {
    const data = [
        {date: '2023-01-01', views: 100, likes: 10},
        {date: '2023-01-02', views: 200, likes: 20},
    ];

    const expected = 'date,views,likes\n2023-01-01,100,10\n2023-01-02,200,20';
    assert.strictEqual(convertToCSV(data), expected);
});

test('convertToCSV should handle special characters', () => {
    const data = [
        {name: 'John, Doe', note: 'He said "Hello"'},
    ];

    const expected = 'name,note\n"John, Doe","He said ""Hello"""';
    assert.strictEqual(convertToCSV(data), expected);
});

test('convertToCSV should handle empty array', () => {
    assert.strictEqual(convertToCSV([]), '');
});

test('convertToCSV should use custom headers if provided', () => {
    const data = [
        {a: 1, b: 2},
        {a: 3, c: 4},
    ];
    const headers = ['a', 'b', 'c'];
    const expected = 'a,b,c\n1,2,\n3,,4';
    assert.strictEqual(convertToCSV(data, headers), expected);
});
