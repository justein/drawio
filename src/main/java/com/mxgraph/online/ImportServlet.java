package com.mxgraph.online;

import com.google.gson.Gson;
import com.mxgraph.io.ethernet.DrawEtherService;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@SuppressWarnings("serial")
public class ImportServlet extends HttpServlet
{
	private DrawEtherService drawEtherService;

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException 
	{
		handlePost(req, resp);
	}

	public  void handlePost(HttpServletRequest request,
								  HttpServletResponse response) throws ServletException, IOException {
		drawEtherService = new DrawEtherService();
		String resData = drawEtherService.getDrawDataTest();
		if (resData!=null && resData!="") {
			response.setStatus(HttpServletResponse.SC_OK);
			response.setCharacterEncoding("UTF-8");
			response.setContentType("text/html; charset=utf-8");
			String jsonStr = "{\"name\":"+resData+"}";
			//Gson gson = new Gson();
			//gson.toJson(jsonStr);
			response.getWriter().print(resData);
		}

	}


	
}
