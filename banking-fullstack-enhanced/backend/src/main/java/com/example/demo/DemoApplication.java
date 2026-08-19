package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {

		System.out.println("========== ENV CHECK ==========");

		System.out.println(
				"MAILJET_API_KEY = " +
						(System.getenv("MAILJET_API_KEY") != null)
		);

		System.out.println(
				"MAILJET_SECRET_KEY = " +
						(System.getenv("MAILJET_SECRET_KEY") != null)
		);

		System.out.println("===============================");

		SpringApplication.run(DemoApplication.class, args);
	}
}