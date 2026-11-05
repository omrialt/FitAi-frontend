package com.fitai.app;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class JsNumbersTest {

    // The case that broke the live workout notification: org.json hands a
    // 13-digit epoch time over as a Long.
    @Test
    public void readsAnEpochTimeThatArrivedAsLong() {
        assertEquals(1793001234567L, JsNumbers.toMillis(1793001234567L));
    }

    @Test
    public void readsTheOtherNumericShapes() {
        assertEquals(42L, JsNumbers.toMillis(42));
        assertEquals(1793001234567L, JsNumbers.toMillis(1793001234567.0));
        assertEquals(1793001234567L, JsNumbers.toMillis("1793001234567"));
    }

    @Test
    public void treatsMissingOrGarbageAsZero() {
        assertEquals(0L, JsNumbers.toMillis(null));
        assertEquals(0L, JsNumbers.toMillis("soon"));
        assertEquals(0L, JsNumbers.toMillis(new Object()));
    }
}
